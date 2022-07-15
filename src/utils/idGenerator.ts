let lastId = 0;

export function generateUniqueId() {
  return (++lastId).toString();
}
