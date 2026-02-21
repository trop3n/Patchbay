import { PrismaClient, Role, SystemStatus, DiagramType, AssetStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      email: 'admin@patchbay.local',
      name: 'Admin User',
      username: 'admin',
      role: Role.ADMIN,
    },
  })

  console.log('Created admin user:', adminUser.username)

  const system = await prisma.system.upsert({
    where: { slug: 'main-conference-room' },
    update: {},
    create: {
      name: 'Main Conference Room',
      slug: 'main-conference-room',
      description: 'Primary video conferencing and presentation system',
      location: 'Building A, Floor 2',
      category: 'Video',
      status: SystemStatus.OPERATIONAL,
      createdById: adminUser.id,
    },
  })

  console.log('Created system:', system.name)

  const diagram = await prisma.diagram.create({
    data: {
      title: 'Conference Room Signal Flow',
      description: 'Main signal routing diagram',
      type: DiagramType.SIGNAL_FLOW,
      data: {
        nodes: [],
        edges: [],
      },
      systemId: system.id,
      createdById: adminUser.id,
    },
  })

  console.log('Created diagram:', diagram.title)

  const asset = await prisma.asset.create({
    data: {
      name: 'Crestron CP4N',
      serialNumber: 'CP4N-001',
      model: 'CP4N',
      manufacturer: 'Crestron',
      location: 'Rack A1',
      status: AssetStatus.ACTIVE,
      notes: 'Main control processor',
      systemId: system.id,
      createdById: adminUser.id,
    },
  })

  console.log('Created asset:', asset.name)

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
