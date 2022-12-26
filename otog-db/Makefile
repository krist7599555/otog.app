FLY_APP = "otog-db"
FLY_ORG = "personal"
# TODO: should hide password to private but lets public it for now to easy contribute
# default password is 'santikku'
PG_PASSWORD = "santikku"
PG_CONNECTION = "postgres://postgres:$(PG_PASSWORD)@$(FLY_APP).fly.dev:5432/postgres"
deploy:
	fly deploy --auto-confirm

create:
	fly pg create --name $(FLY_APP) --password $(PG_PASSWORD) --machines --region sin --volume-size 1 --volume-size 1 --initial-cluster-size  1 --vm-size shared-cpu-1x --org $(FLY_ORG)
	fly ips allocate-v4 --app $(FLY_APP)
	fly ips allocate-v6 --app $(FLY_APP)
	fly deploy --config ./fly.toml --app $(FLY_APP) --image flyio/postgres:14 --auto-confirm

sql_console:
	psql $(PG_CONNECTION)

show_connection_string:
	echo $(PG_CONNECTION)

destroy:
	fly apps destroy $(FLY_APP)

all:
	@echo "please set PG_PASSWORD before to override defalut password"
	@echo "example:\n  make PG_PASSWORD=xxxxxxxx [cmd]"
	@echo $(PG_PASSWORD)