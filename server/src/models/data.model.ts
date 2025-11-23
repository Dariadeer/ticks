import prisma from "../config/db.config";

function cities() {
    return prisma.location.findMany({
        select: {
            id: true,
            name: true,
            admin_name: true
        },
        orderBy: {
            name: 'asc'
        }
    })
}

export default { cities }