import { CodeSandbox } from "@codesandbox/sdk";

export async function go() {
  const sdk = new CodeSandbox('');

  const sandbox = await sdk.sandbox.create();

  let result = await sandbox.shells.run("curl -L -o butler.zip https://broth.itch.ovh/butler/linux-amd64/LATEST/archive/default");

  result = await sandbox.shells.run("unzip butler.zip");

  result = await sandbox.shells.run("chmod +x butler");

  result = await sandbox.shells.run("./butler -V");
  console.log(result);
}
