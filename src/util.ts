import * as fs from "fs";

export function getProtoFiles(protoDir: string) {
  const protoFiles = fs.readdirSync(protoDir)
  const files = []
  for (let protoFile of protoFiles) {
    files.push(`${protoDir}/${protoFile}`)
  }
  return files;
}