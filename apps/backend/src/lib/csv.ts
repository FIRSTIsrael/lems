export type CSVLine = Record<string, string>;
export type Line = string[];
export type Block = { id: number; lines: Line[] };

export const getBlock = (blocks: Array<Block>, blockId: number) => {
  const block = blocks.find(b => b.id === blockId)?.lines;
  return structuredClone(block);
};

export const extractBlocksFromFile = (file: CSVLine[]): Array<Block> => {
  const blocks = [];
  for (let fileLine = 0; fileLine < file.length; fileLine++) {
    if (file[fileLine][0] === 'Block Format') {
      const blockId = parseInt(file[fileLine][1]);
      const blockLines = [];

      for (let blockLine = fileLine + 1; blockLine < file.length; blockLine++) {
        if (file[blockLine][0] !== 'Block Format') {
          blockLines.push(Object.values(file[blockLine]));
        } else {
          fileLine = blockLine - 1;
          break;
        }
      }

      blocks.push({ id: blockId, lines: blockLines });
    }
  }
  return blocks;
};
