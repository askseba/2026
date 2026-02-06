const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
p.fragellaCache.deleteMany()
  .then((r) => {
    console.log('Deleted', r.count, 'FragellaCache entries')
    return p.$disconnect()
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
