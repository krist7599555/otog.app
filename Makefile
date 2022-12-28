function terraform_target() {
  cat main.tf | awk '($1 == "resource") {print $2 "." $3}' | sed s/\"//g
}

"$@"
