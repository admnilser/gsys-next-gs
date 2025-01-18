/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");

const entitiesJsonPath = path.join(process.cwd(), "./entities.json");

async function generate(folder, template, indexTemplate) {
  const folderPath = path.join(process.cwd(), folder);
  const templatePath = path.join(process.cwd(), template);

  const entitiesData = JSON.parse(fs.readFileSync(entitiesJsonPath, "utf-8"));
  const entities = entitiesData.entities;

  if (!Array.isArray(entities)) {
    console.error(
      'O arquivo entities.json deve conter um array em "entities".'
    );
    process.exit(1);
  }

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  fs.readdirSync(folderPath).forEach((file) => {
    fs.unlinkSync(path.join(folderPath, file));
  });

  const templateContent = fs.readFileSync(templatePath, "utf-8");

  let indexContent = "";
  if (indexTemplate) {
    const indexTemplatePath = path.join(process.cwd(), indexTemplate);
    indexContent = fs.readFileSync(indexTemplatePath, "utf-8") + "\n\n";
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

  console.log("Arquivos gerados com sucesso!");
}

const execute = async () => {
  await generate("./actions", "./next-gs/cmd/generate-actions.template");

  await generate(
    "./hooks",
    "./next-gs/cmd/generate-hooks.template",
    "./next-gs/cmd/generate-hooks-index.template"
  );
};

// Executar o script
execute().catch((err) => {
  console.error("Erro ao gerar ações:", err);
  process.exit(1);
});
