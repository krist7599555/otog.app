FLY_APP = otog
FLY_ORG = personal
PG_PASSWORD = santikku
FLY_DB_APP = otog-db
PG_CONNECTION = postgres://postgres:santikku@$(FLY_DB_APP).fly.dev:5432/postgres
FLY_VOLUME = /otog

# not good idea to patch version like this
# IMAGE_VERSION = $(shell pnpm version patch --no-git-tag-version)
IMAGE_VERSION = v8

FLY_MACHINE_OTOG_APP_NAME = otog-svelte

create_all:
	make create_app
	make create_volume
	make create_machine

create_app:
	flyctl apps create --machines --name $(FLY_APP) --org $(FLY_ORG)
	flyctl ips allocate-v4 --shared --app $(FLY_APP)
	flyctl ips allocate-v6 --app $(FLY_APP)

create_volume:
	flyctl volume create otog_data --app $(FLY_APP) --no-encryption --size 1 --region sin

create_machine:
	flyctl machine run . \
		--app $(FLY_APP) --org $(FLY_ORG) \
		--name $(FLY_MACHINE_OTOG_APP_NAME) \
		--env MOUNT_VOLUME=/otog \
		--env PORT=8081 \
		--env DATABASE_URL=$(PG_CONNECTION) \
		--dockerfile ./Dockerfile \
		--port 80:8081/tcp:http \
		--port 443:8081/tcp:tls \
		--port 443:8081/tcp:http \
		--volume otog_data:/otog \
		--region sin;

# deploy new docker and update exists image
update:
	@echo $(IMAGE_VERSION)
	flyctl deploy --image-label $(IMAGE_VERSION) --build-only --push --app $(FLY_APP)
	flyctl image update --image registry.fly.io/$(FLY_APP):$(IMAGE_VERSION) --app $(FLY_APP) --yes

image:
	flyctl deploy --image-label latest --build-only --push --app $(FLY_APP)

destroy: SHELL:=/bin/bash
destroy:
	@bash -c "\
		flyctl machine list --app $(FLY_APP) --json \
		| tee /dev/stderr \
		| grep -v "^No"  \
		| tee /dev/stderr \
		| jq -r '.[] | select(.name == \"$(FLY_MACHINE_OTOG_APP_NAME)\") | .id' \
		| tee /dev/stderr \
		| xargs -n 1 -I {} -t flyctl machine remove {} --app $(FLY_APP) --force"


recreate:
	make destroy
	make create

TERRAFORM_RESOURCES := $(shell bash ./Makefile.sh terraform_target)

.PHONY: terraform_apply
terraform_apply:
	terraform apply

.PHONY: terraform_state_rm
terraform_state_rm:
	@for target in $(TERRAFORM_RESOURCES); do \
		echo $$target ; \
		terraform state rm $$target ; \
	done



# MACHINE_ID := $(call machine_id,$(FLY_MACHINE_OTOG_APP_NAME))

# ifdef $(MACHINE_ID)
# echo will remove $(MACHINE_ID)
# else
# echo not found machine name $(FLY_MACHINE_OTOG_APP_NAME)
# endif

# deploy:
# 	flyctl deploy --remote-only --auto-confirm 

# __create_all_unsafe_once:
# 	flyctl apps create --machines --auto-confirm
#   flyctl deploy -c ./fly.toml --auto-confirm	
#   flyctl vol create otog_data --no-encryption --size 1 --region sin
# 	flyctl pg attach otog-db --database-name otog --database-user otog --variable-name DATABASE_URL
