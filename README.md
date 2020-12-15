![Main](https://github.com/tsimbalar/gha-build-monitor/workflows/Main/badge.svg?event=push)

# gha-build-monitor
Adapter to give access to GitHub Actions status via the CatLight Protocol

## Getting started

### Starting the "proxy"
- `INSTALLATION_ID` : something unique that represents your instance
- by default, listening on port `9901`

```
docker run --name gha-build-monitor -d -p 9901:9901 --env INSTALLATION_ID=whatever ghcr.io/tsimbalar/gha-build-monitor:main
```

Open `http://localhost:9901/_/healthcheck` in a browser to check that the server is up and running.

### Creating a GitHub Access Token
You need a Personal Access Token (PAT) with the `repo` scope.

- Go to https://github.com/settings/tokens
- Create a token (for instance `gha-build-monitor`)
- ... with the scope `repo`

### Connecting Catlight
In CatLight, you need to : 
- Add new connection
- choose "CatLight-compatible"
- To login choose : 
  - Url : `http://localhost:9901/basic` (or another port if you chose it)
  - "Use token"
  - paste your PAT
- Connect

