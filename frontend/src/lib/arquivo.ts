// Baixa um texto como arquivo pelo navegador, com o nome dado (ex.: o CSV do histórico, F11)
export function baixarArquivo(nome: string, conteudo: string, tipo: string): void {
  const endereco = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const link = document.createElement("a");
  link.href = endereco;
  link.download = nome;
  link.click();
  URL.revokeObjectURL(endereco);
}
