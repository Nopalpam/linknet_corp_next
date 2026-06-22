const OLD_URL_PATTERN = 'https://(www\\.)?linknet\\.co\\.id/+';
const OLD_URL_REGEX = /https:\/\/(?:www\.)?linknet\.co\.id\/+/gi;
const CDN_PREFIX = 'https://d24cmpzg3ht16e.cloudfront.net/';
const DUPLICATE_CDN_SLASH_PATTERN = 'https://d24cmpzg3ht16e\\.cloudfront\\.net/{2,}';
const DUPLICATE_CDN_SLASH_REGEX = /https:\/\/d24cmpzg3ht16e\.cloudfront\.net\/{2,}/gi;

function normalizeLinknetUrls(value) {
  return typeof value === 'string'
    ? value.replace(OLD_URL_REGEX, CDN_PREFIX).replace(DUPLICATE_CDN_SLASH_REGEX, CDN_PREFIX)
    : value;
}

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function rewriteLinknetUrls(client) {
  const columns = await client.$queryRawUnsafe(`
    SELECT c.table_name, c.column_name, c.data_type, c.udt_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND (
        c.data_type IN ('text', 'character varying', 'character', 'json', 'jsonb')
        OR (c.data_type = 'ARRAY' AND c.udt_name IN ('_text', '_varchar'))
      )
    ORDER BY c.table_name, c.ordinal_position
  `);

  const changedColumns = [];
  let changedRows = 0;

  for (const column of columns) {
    const tableName = quoteIdentifier(column.table_name);
    const columnName = quoteIdentifier(column.column_name);
    let expression;
    let predicate;

    if (column.data_type === 'json' || column.data_type === 'jsonb') {
      expression = `regexp_replace(regexp_replace(${columnName}::text, $1, $2, 'gi'), $3, $2, 'gi')::${column.data_type}`;
      predicate = `${columnName}::text ~* $1 OR ${columnName}::text ~* $3`;
    } else if (column.data_type === 'ARRAY') {
      expression = `ARRAY(
        SELECT regexp_replace(regexp_replace(item, $1, $2, 'gi'), $3, $2, 'gi')
        FROM unnest(${columnName}) WITH ORDINALITY AS values_with_order(item, item_order)
        ORDER BY item_order
      )`;
      predicate = `array_to_string(${columnName}, '') ~* $1 OR array_to_string(${columnName}, '') ~* $3`;
    } else {
      expression = `regexp_replace(regexp_replace(${columnName}, $1, $2, 'gi'), $3, $2, 'gi')`;
      predicate = `${columnName} ~* $1 OR ${columnName} ~* $3`;
    }

    const count = await client.$executeRawUnsafe(
      `UPDATE "public".${tableName} SET ${columnName} = ${expression} WHERE ${predicate}`,
      OLD_URL_PATTERN,
      CDN_PREFIX,
      DUPLICATE_CDN_SLASH_PATTERN,
    );

    if (count > 0) {
      changedColumns.push({ table: column.table_name, column: column.column_name, rows: count });
      changedRows += count;
    }
  }

  return { changedColumns, changedRows };
}

module.exports = {
  CDN_PREFIX,
  OLD_URL_PATTERN,
  normalizeLinknetUrls,
  rewriteLinknetUrls,
};
