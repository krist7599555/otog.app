IMAGE_NAME = "registry.fly.io/otog-app"
define otog_version
	$(shell cat package.json | jq -r '.version')
endef

patchversion:
	pnpm version patch --no-git-tag-version

deploy: patchversion
	fly deploy --remote-only --auto-confirm ./



.PHONY: 