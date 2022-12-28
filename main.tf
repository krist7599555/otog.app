terraform {
  required_providers {
    fly = {
      source  = "fly-apps/fly"
      version = "0.0.16"
    }
  }
}

resource "fly_app" "otogApp" {
  name = "otog"
  org  = "personal"
}

resource "fly_ip" "otogIp" {
  app        = "otog"
  type       = "v4"
  depends_on = [fly_app.otogApp]
}

resource "fly_ip" "otogIpv6" {
  app        = "otog"
  type       = "v6"
  depends_on = [fly_app.otogApp]
}

resource "fly_volume" "otogVolume" {
  app        = "otog"
  name       = "otog_data"
  region     = "sin"
  size       = 1
  depends_on = [fly_app.otogApp]
}

resource "fly_machine" "otogMachine" {
  app    = "otog"
  region = "sin"
  name   = "otog"
  image  = "registry.fly.io/otog:latest"
  env = {
    MOUNT_VOLUME   = "/otog"
    PORT           = "8080"
    PRIMARY_REGION = "sin"
  }
  mounts = [
    {
      path      = "/otog"
      volume    = "otog_data"
      encrypted = false
      size_gb   = 1
    }
  ]
  services = [
    {
      ports = [
        {
          port     = 443
          handlers = ["tls", "http"]
        },
        {
          port        = 80
          handlers    = ["http"]
          force_https = true
        }
      ]
      "protocol" : "tcp",
      "internal_port" : 8080,
      tcp_checks = {
        grace_period  = "1s"
        interval      = "14s"
        restart_limit = 0
        timeout       = "2s"
      }
    },
  ]
  cpus       = 1
  memorymb   = 256
  cputype    = "shared"
  depends_on = [fly_app.otogApp, fly_volume.otogVolume]
}
