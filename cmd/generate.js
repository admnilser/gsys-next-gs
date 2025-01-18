/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");

const entities = [];

fs.readdirSync("./models").forEach((file) => {
  let name = path.basename(file, path.extname(file));
  entities.push(name.charAt(0).toUpperCase() + name.slice(1));
});

async function generate(name, folder, template) {
  const folderPath = path.join(process.cwd(), folder);
  const templatePath = path.join(process.cwd(), template);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  fs.readdirSync(folderPath).forEach((file) => {
    fs.unlinkSync(path.join(folderPath, file));
  });

  const templateContent = fs.readFileSync(`${templatePath}.template`, "utf-8");

  let indexContent = "";

  const indexPath = templatePath + "-index.template";
  if (fs.existsSync(indexPath)) {
    indexContent = fs.readFileSync(indexPath, "utf-8") + "\n\n";
  }

  entities.forEach((entity) => {
    const entityLower = entity.toLowerCase();

    const filePath = path.join(folderPath, `${entityLower}.ts`);

    const fileContent = templateContent
      .replace(/%\{Entity\}/g, entity)
      .replace(/%\{entity\}/g, entityLower);

    fs.writeFileSync(filePath, fileContent, "utf-8");

    console.log(`Arquivo gerado: ${filePath}`);

    indexContent += `export * from "./${entityLower}";\n`;
  });

  fs.writeFileSync(path.join(folderPath, "index.ts"), indexContent, "utf-8");

  console.log(`${name} gerados com sucesso!`);
}

const execute = async () => {
  await generate("Actions", "./actions", "./next-gs/cmd/generate-actions");
  await generate("Hooks", "./hooks", "./next-gs/cmd/generate-hooks");
};

if (entities.length > 0) {
  execute().catch((err) => {
    console.error("Erro ao gerar ações:", err);
    process.exit(1);
  });
}
