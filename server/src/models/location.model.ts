import prisma from "../config/db.config";

function get(...ids: number[]) {
    return prisma.location.findMany({
        where: {
            id: {
                in: ids
            }
        }
    })
}

export default {
    get
}