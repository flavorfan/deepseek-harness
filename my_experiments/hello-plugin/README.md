

## 安装进 profile
dsh plugin --profile <name> <args...> 在 profile 目录内转发给 pnpm，因此所有 pnpm 子命令都可用。在包含 hello-plugin 的目录中安装该包的 checkout：

```bash

pnpm dsh plugin --profile demo add ./my_experiments/hello-plugin

pnpm dsh --profile demo --dump-config
# shows a "# == dsh-hello-plugin" layer
pnpm dsh --profile demo


pnpm dsh plugin --profile demo remove dsh-hello-plugin
```
