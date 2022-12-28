# OTOG.APP

## How to run local

1. install using `pnpm`
1. make sure you have `.env` file which include `DATABASE_URL=`
1. run `pnpm run dev` to start local server

## How to Deply

run api proxy in background

1. `flyctl machine api-proxy --org personal`
run in step to create app
1. `terraform apply -target=fly_app.otogApp -auto-approve`
run in step to upload image to app
1. `flyctl deploy --image-label latest --build-only --push --app otog`
add postgres secret
1. `fly secrets set DATABASE_URL=postgres://postgres:xxxxxxxxx@otog-db.fly.dev:5432/postgres`
deploy machine
1. `terraform apply -auto-approve`
