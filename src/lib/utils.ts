export function rupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export function bintang(r: number): string {
  return '★'.repeat(Math.floor(r)) + '☆'.repeat(5 - Math.ceil(r))
}

export function kodePesanan(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `AGR-${date}-${rand}`
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
