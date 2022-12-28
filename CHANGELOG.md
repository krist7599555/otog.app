# Changelog

## 1.0.0 (2022-12-28)


### ⚠ BREAKING CHANGES

* add terraform
* disable ssh port 22
* override default fly.toml config

### Features

* feat:  ([587756f](https://github.com/krist7599555/otog.app/commit/587756f48c94392e1ca1a1423e28f48543e09b85))
* add isolate ([2275c04](https://github.com/krist7599555/otog.app/commit/2275c04d252c2279adfe886ac16917c968972fb8))
* add node version to build pack ([ac50580](https://github.com/krist7599555/otog.app/commit/ac50580cdd9df711eb51aaaa68fd47a2b1c2ba51))
* add release-please (google changelog manager) ([786bed1](https://github.com/krist7599555/otog.app/commit/786bed18e362f8593e529ac436bc1b1c8386ac8e))
* add terraform ([d8e3aa3](https://github.com/krist7599555/otog.app/commit/d8e3aa3f75c7d09185976f8268e48ee2f029e0f5))
* basic ftp ([1941f5d](https://github.com/krist7599555/otog.app/commit/1941f5d4d5e401584fe983435f1b1115e2ce0e2e))
* create many route ([5484686](https://github.com/krist7599555/otog.app/commit/5484686e3e0b22f1d1a47a7c7b719621bd92457e))
* docker otog-isolate ([7a9cb41](https://github.com/krist7599555/otog.app/commit/7a9cb41b6b7b0f52db8a35516085bfc06bd4d5f4))
* dockerize ([3e4d40e](https://github.com/krist7599555/otog.app/commit/3e4d40e3ec24456003a6d26b26269238bbab9d20))
* explicit TF_VAR_FLY_API_TOKEN ([b25fe96](https://github.com/krist7599555/otog.app/commit/b25fe9677682e13476ded34008d17b200030b2d3))
* fly toml ([211a4c7](https://github.com/krist7599555/otog.app/commit/211a4c75186bf8fd82eaa9d91713c7ef0e8f63c3))
* flycicd ([3cd4570](https://github.com/krist7599555/otog.app/commit/3cd4570fa4db70a235739dfce19fdd9838d5ee5c))
* init ([ad1d338](https://github.com/krist7599555/otog.app/commit/ad1d338ef8fd01e0511879aa8b006955253b141c))
* install g++ in docker ([63e9bc9](https://github.com/krist7599555/otog.app/commit/63e9bc9bef2553d5c524155cfe5c5174b0951335))
* makegile script ([4c28755](https://github.com/krist7599555/otog.app/commit/4c28755133040c536476483eb362f10a7a7a63ee))
* override default fly.toml config ([fccce12](https://github.com/krist7599555/otog.app/commit/fccce120bc221c0629e941dd7a828732e04ae75a))
* ping ([485d75c](https://github.com/krist7599555/otog.app/commit/485d75c8f4622f2e9d98c38c9ad937fb106609f8))
* ping ([132abf9](https://github.com/krist7599555/otog.app/commit/132abf9d0f8f516fbeeaec59544a8981afad221b))
* poc vsftpd server ([5d6367b](https://github.com/krist7599555/otog.app/commit/5d6367bb34d56c76ec1cf544596bb5323a2ce73f))
* problem edit ([3386a7a](https://github.com/krist7599555/otog.app/commit/3386a7a6b0aab0431a8a3654deefa3f9bc911b7a))
* s3 upload ([eeb869d](https://github.com/krist7599555/otog.app/commit/eeb869da93963bf31de27ae1f2f780535e0eec20))
* samepte  isolate test ([9b22087](https://github.com/krist7599555/otog.app/commit/9b22087f98aaf16e48e1f5be813c65d429f63f82))
* try isolate machine ([5114838](https://github.com/krist7599555/otog.app/commit/5114838cd4889084538bf052049a72c723a52d0b))
* update otog-db to expose port ([1893045](https://github.com/krist7599555/otog.app/commit/1893045d0b389cd12a227c54cb4719e72a7265fd))
* use machine to run cicd ([8b9747b](https://github.com/krist7599555/otog.app/commit/8b9747b3158fe05a5e0e4ef75cb293165f673bda))


### Bug Fixes

* add /ping route ([f079f02](https://github.com/krist7599555/otog.app/commit/f079f026c35ef3e22bf334032b67f4c0635cc4ff))
* add npmrc ([7945f29](https://github.com/krist7599555/otog.app/commit/7945f29e82b047c1a5d852a9c3897883d4511a79))
* add prisma ([404fcff](https://github.com/krist7599555/otog.app/commit/404fcffef5de51bbc9143033df46943c187f504a))
* base work dir ([1c58b20](https://github.com/krist7599555/otog.app/commit/1c58b20862be1bbb0c7913853d8bc5edfcd2e4b1))
* **build:** no prerender ([49a0088](https://github.com/krist7599555/otog.app/commit/49a0088a6aeef57fe56c6e6865a4c96f8dd3cba8))
* **build:** prebuild with prisma ([740787f](https://github.com/krist7599555/otog.app/commit/740787f3d23a49fb0586a0dd87291f1e1604110d))
* copy to workdir ([5cfb695](https://github.com/krist7599555/otog.app/commit/5cfb6956f072e8a89bffa7b6916ca49c5eb32dba))
* disable ssh port 22 ([6466928](https://github.com/krist7599555/otog.app/commit/6466928c6f145b5b2cf7e06cec7ae992afb6f7d9))
* docker copy directory ([5f75ce9](https://github.com/krist7599555/otog.app/commit/5f75ce9ef3fd482ab79ae393abc65e2e569fa3c2))
* install g++ ([a097876](https://github.com/krist7599555/otog.app/commit/a0978761249c043359b445c9e260ce0946ce6bb5))
* no start command ([6dc19d6](https://github.com/krist7599555/otog.app/commit/6dc19d624d03fce5282e8b29f9163117a4a35770))
* remove bulid sectiob ([171bd01](https://github.com/krist7599555/otog.app/commit/171bd01aeb8887499281e596046fd47b94a29b88))
* remove DATABASE_URL check on build ([8088350](https://github.com/krist7599555/otog.app/commit/80883500f20d317b0cc7a28ccc1caf1d4d0a2ac2))
* remove dup key ([9fb5f64](https://github.com/krist7599555/otog.app/commit/9fb5f64ed44da4cc17b5b4c51e38383b453fe7cd))
* remove port 22 ([bff4b5d](https://github.com/krist7599555/otog.app/commit/bff4b5df06286939560cd59379e295fb6b454ed5))
* same line ([d09615b](https://github.com/krist7599555/otog.app/commit/d09615b2ef1adaa3e89ffee75d49bca0a36fc8be))
