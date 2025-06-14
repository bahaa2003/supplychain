import fs from "fs";
import path from "path";
const __dirname = import.meta.dirname;
import handlebars from "handlebars";

export default function renderTemplate(
  folder = "notification",
  templateName,
  data
) {
  const filePath = path.join(
    __dirname,
    `../templates/${folder}/${templateName}.hbs`
  );
  const source = fs.readFileSync(filePath, "utf-8");
  const template = handlebars.compile(source);
  return template(data);
}
