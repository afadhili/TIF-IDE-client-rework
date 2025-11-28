export function validateFileName(name: string): string | null {
  if (!name) return "File name cannot be empty";
  if (name.trim().length === 0) return "File name cannot be only whitespace";
  if (name === "." || name === "..") return 'File name cannot be "." or ".."';
  if (name.length > 255) return "File name is too long";

  // control chars (0x00-0x1F and DEL)
  if (/[\x00-\x1F\x7F]/.test(name))
    return "File name contains control characters";

  // POSIX null or slash
  if (/[\/\u0000]/.test(name))
    return "File name cannot contain '/' or null char";

  // Windows forbidden chars: < > : " / \ | ? *
  if (/[<>:"\/\\|?*\x00-\x1F]/.test(name))
    return 'File name contains forbidden characters: <>:"/\\|?*';

  // Windows trailing space or dot (common cross-platform concern)
  if (/[ .]$/.test(name)) return "File name cannot end with a space or dot";

  // reserved device names on Windows (check base before extension)
  const base =
    name.indexOf(".") === -1 ? name : name.slice(0, name.lastIndexOf("."));
  if (
    [
      "CON",
      "PRN",
      "AUX",
      "NUL",
      "COM1",
      "COM2",
      "COM3",
      "COM4",
      "COM5",
      "COM6",
      "COM7",
      "COM8",
      "COM9",
      "LPT1",
      "LPT2",
      "LPT3",
      "LPT4",
      "LPT5",
      "LPT6",
      "LPT7",
      "LPT8",
      "LPT9",
    ].includes(base.toUpperCase())
  ) {
    return `File name "${base}" is a reserved name on Windows`;
  }

  return null;
}

export function validateFolderName(name: string): string | null {
  if (!name) return "Folder name cannot be empty";
  if (name.trim().length === 0) return "Folder name cannot be only whitespace";
  if (name === "." || name === "..") return 'Folder name cannot be "." or ".."';
  if (name.length > 255) return "Folder name is too long";

  if (/[\x00-\x1F\x7F]/.test(name))
    return "Folder name contains control characters";
  if (/[\/\u0000]/.test(name))
    return "Folder name cannot contain '/' or null char";
  if (/[<>:"\/\\|?*\x00-\x1F]/.test(name))
    return 'Folder name contains forbidden characters: <>:"/\\|?*';
  if (/[ .]$/.test(name)) return "Folder name cannot end with a space or dot";

  if (
    [
      "CON",
      "PRN",
      "AUX",
      "NUL",
      "COM1",
      "COM2",
      "COM3",
      "COM4",
      "COM5",
      "COM6",
      "COM7",
      "COM8",
      "COM9",
      "LPT1",
      "LPT2",
      "LPT3",
      "LPT4",
      "LPT5",
      "LPT6",
      "LPT7",
      "LPT8",
      "LPT9",
    ].includes(name.toUpperCase())
  ) {
    return `Folder name "${name}" is a reserved name on Windows`;
  }

  return null;
}
