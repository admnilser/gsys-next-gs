/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");

const entities = [];

fs.readdirSync("./models").forEach((file) => {
  let name = path.basename(file, path.extname(file));
  if (name !== "index" && name !== "actions") {
    entities.push(name);
  }
});

function processPath(file) {
  return path.join(process.cwd(), file);
}

function clearFolder(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      fs.unlinkSync(path.join(dir, file));
    });
  } else {
    fs.mkdirSync(dir);
  }
}

function writeFile(path, content) {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }

  fs.writeFileSync(path, content, "utf-8");

  console.log(`Arquivo gerado: ${path}`);
}

function replaceEntityName(template, name) {
  const nameCap = name.charAt(0).toUpperCase() + name.slice(1);
  return template
    .replace(/%\{Entity\}/g, nameCap)
    .replace(/%\{entity\}/g, name);
}

async function generateActions() {
  const dirPath = processPath("./actions");
  const tmpPath = processPath("./next-gs/cmd/generate-actions.template");
  const tmpText = fs.readFileSync(tmpPath, "utf-8");

  clearFolder(dirPath);

  let indexText = "";
  entities.forEach((entity) => {
    indexText += `export * from "./${entity}";\n`;

    writeFile(
      path.join(dirPath, `${entity}.ts`),
      replaceEntityName(tmpText, entity)
    );
  });

  writeFile(path.join(dirPath, "index.ts"), indexText);
}

async function generateResources() {
  let indexText = `"use client"

import { registerEntityActions } from "../next-gs";

import * as serverActions from "../actions";

registerEntityActions(serverActions);\n\n`;

  entities.forEach(async (entity) => {
    indexText += `import { resource as ${entity} } from "./${entity}";\n`;
  });

  indexText += "\nconst resources = { " + entities.join(", ") + "};\n\n";

  indexText += "export default resources";

  writeFile(processPath("./models/index.ts"), indexText, "utf-8");
}

const execute = async () => {
  await generateActions();
  await generateResources();
};

if (entities.length > 0) {
  execute()
    .then(() => {
      console.log(`Arquivos gerados com sucesso!`);
    })
    .catch((err) => {
      console.error("Erro ao gerar ações:", err);
      process.exit(1);
    });
}
