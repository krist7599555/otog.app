use regex::Regex;
use rocket::http::Status;
use rocket::serde::{json::Json, Deserialize, Serialize};
use std::path::{Path, PathBuf};
extern crate rocket_contrib;
use rocket::{get, launch, post, routes, uri};
use rocket_contrib::json::JsonValue;
use serde_json::json;
use tokio::fs;
use tokio::process::Command;

#[get("/hello/<name>/<age>")]
fn get_hello(name: &str, age: u8) -> String {
    format!("Hello, {} year old named {}!", age, name)
}
#[get("/")]
fn get_index() -> String {
    format!("Hello, World!")
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct JudgeInput {
    lang: String,
    source_code: String,
    problem: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct JudgeOutput {
    score: i32,
    result: String,
}

#[derive(Debug, Serialize)]
#[serde(crate = "rocket::serde")]
struct Isolate {
    box_id: u16,
    path: std::path::PathBuf,
}
impl Isolate {
    async fn cleanup(box_id: u16) -> Result<(), String> {
        let ps = Command::new("isolate")
            .args(&["--cleanup", "--box-id", &box_id.to_string()])
            .output()
            .await
            .map_err(|err| err.to_string())?;

        // let stdout = String::from_utf8_lossy(ps.stdout.as_slice());
        let stderr = String::from_utf8_lossy(ps.stderr.as_slice());
        if ps.status.success() {
            Ok(())
        } else {
            Err(stderr.trim().to_string())
        }
    }
    async fn new(box_id: u16) -> Result<Isolate, String> {
        let ps = Command::new("isolate")
            .args(&["--init", "--box-id", &box_id.to_string()])
            .output()
            .await
            .map_err(|err| err.to_string())?;

        let stdout = String::from_utf8_lossy(ps.stdout.as_slice());
        let stderr = String::from_utf8_lossy(ps.stderr.as_slice());
        if ps.status.success() {
            Ok(Isolate {
                box_id,
                path: PathBuf::from(stdout.trim()),
            })
        } else {
            Err(stderr.trim().to_string())
        }
    }
    async fn destroy(self) -> Result<(), String> {
        return Isolate::cleanup(self.box_id).await;
    }
    async fn run(
        &self,
        isolate_argument: &[&str],
        command: &[&str],
    ) -> Result<serde_json::Value, serde_json::Value> {
        let ps = Command::new("isolate")
            .args(
                &[
                    &["--run", "--box-id", &self.box_id.to_string()],
                    isolate_argument,
                    &["--"],
                    &command,
                ]
                .concat(),
            )
            .output()
            .await;
        return match ps {
            Err(err) => Err(json!({ "message": err.to_string() })),
            Ok(ps) => Ok(json!({
                "stdout": String::from_utf8_lossy(ps.stdout.as_slice()),
                "stderr": String::from_utf8_lossy(ps.stderr.as_slice()),
            })),
        };
    }
}

#[post("/judge", data = "<judge_data>")]
async fn post_judge(judge_data: Json<JudgeInput>) -> (Status, serde_json::Value) {
    let mut isolate: Option<Isolate> = None;
    for i in 1..1000 {
        let _ = Isolate::cleanup(i).await;
        let _isolate = Isolate::new(i).await;
        println!("isolate = {:?}", _isolate);
        if let Ok(iso) = _isolate {
            isolate = Some(iso);
            break;
        }
    }

    return match isolate {
        None => (
            Status::InternalServerError,
            json!({ "message": "can not allocate isolate sandbox" }),
        ),
        Some(iso) => {
            let _ = fs::write(iso.path.join("main.cpp"), judge_data.source_code.as_bytes()).await;
            let problem_dir = std::env::current_dir()
                .expect("current_dir must defined")
                .join("problems")
                .join(judge_data.problem.to_string());

            let mut problem_file_entries = fs::read_dir(problem_dir.clone()).await.expect(
                format!("must able to read dir {:?}", problem_dir.to_string_lossy()).as_str(),
            );
            let mut ext_in: Vec<u16> = vec![];
            let mut ext_sol: Vec<u16> = vec![];
            while let Some(entry) = problem_file_entries.next_entry().await.unwrap_or(None) {
                let filename = entry.file_name().to_string_lossy().to_string();
                let cap = Regex::new(r"^(\d+).(in|sol)$").unwrap().captures(&filename);
                match cap {
                    Some(c) => {
                        let num = c.get(1).unwrap().as_str().parse::<u16>().unwrap();
                        let typ = c.get(2).unwrap().as_str();
                        match typ {
                            "in" => {
                                ext_in.push(num);
                                let _ =
                                    fs::copy(entry.path(), iso.path.join("box").join(&filename))
                                        .await
                                        .unwrap();
                            }
                            "sol" => {
                                ext_sol.push(num);
                                let _ = fs::copy(entry.path(), iso.path.join(&filename))
                                    .await
                                    .unwrap();
                            }
                            _ => unreachable!(),
                        }
                    }
                    None => {
                        let _ = fs::copy(entry.path(), iso.path.join(&filename))
                            .await
                            .unwrap();
                    }
                }

                println!("{:?} {:?}", filename, entry);
            }

            let _ = fs::write(iso.path.join("main.cpp"), judge_data.source_code.as_bytes())
                .await
                .unwrap();

            let compile_ps = Command::new("g++")
                .arg("-std=c++20")
                .arg("-O2")
                .arg("./main.cpp")
                .arg("-o")
                .arg("./box/bin")
                .current_dir(&iso.path)
                .output()
                .await;

            let _ = match compile_ps {
                Err(ps) => {
                    return (
                        Status::BadRequest,
                        json!({ "message": "UnknowError", "detail": ps.to_string() }),
                    );
                }
                Ok(ps) => {
                    if ps.status.success() {
                        ()
                    } else {
                        return (
                            Status::BadRequest,
                            json!({ "message": "CompileError", "detail": ps.stderr }),
                        );
                    }
                }
            };

            // TODO: infer testcase count from file name
            // TODO: judge each result

            let r = iso
                .run(
                    &[
                        "--stdin",
                        "1.in",
                        "--stdout",
                        "1.ans",
                        "--meta",
                        "1.meta",
                        "--mem",
                        "100000",
                        "--time",
                        "1.00",
                        "--extra-time",
                        "0.50",
                    ],
                    &["./bin"],
                )
                .await;
            let _ = iso.destroy().await;
            return (
                Status::Ok,
                json!(JudgeOutput {
                    score: 70,
                    result: "PP-P-PPP-P".to_owned(),
                }),
            );
        }
    };
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![get_hello, get_index, post_judge])
}

#[cfg(test)]
mod test {
    use super::rocket;
    use rocket::http::Status;
    use rocket::local::blocking::Client;
    use rocket::{get, launch, post, routes, uri};
    use serde_json::json;

    #[test]
    fn get_index() {
        let client = Client::tracked(rocket()).expect("valid rocket instance");
        let response = client.get(uri!(super::get_index)).dispatch();
        println!("{:?}", response);
        assert_eq!(response.status(), Status::Ok);
        assert_eq!(response.into_string().unwrap(), "Hello, World!");
    }
    #[test]
    fn post_judge_isprime() {
        let client = Client::tracked(rocket()).expect("valid rocket instance");
        let response = client
            .post(uri!(super::post_judge))
            .json(&json!({ "lang": "cpp", "source_code": "int main() {}", "problem": "isprime" }))
            .dispatch();
        println!("{:?}", response.into_json::<serde_json::Value>());
        assert_eq!(response.status(), Status::Ok);
    }
}
