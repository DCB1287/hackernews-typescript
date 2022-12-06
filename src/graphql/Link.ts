import { VariableDefinitionNode } from "graphql";
import { extendType, idArg, intArg, nonNull, objectType, stringArg } from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";  

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
        t.nonNull.dateTime("createdAt");
        t.field("postedBy", {   // 1
            type: "User",
            resolve(parent, args, context) {  // 2
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        });
        t.nonNull.list.nonNull.field("voters", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id }})
                    .voters();
            }
        });
    },
});


export const LinkMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('post', {
            type: 'Link',
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },
            async resolve(parent, args, context) {
                const { description, url } = args;
                const { userId } = context;
                if (!userId) {
                    throw new Error('Cannot post without logging in');
                }

                const newLink = await context.prisma.link.create({
                    data: {
                        description: description,
                        url: url,
                        postedBy: { connect: { id: userId }},
                    },
                });
                return newLink;
            },
        });  
    },
});

export const LinkDelete = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('delete', {
            type: 'Int',
            args: {
                id: nonNull(intArg()),
            },
            async resolve(parent, args, context) {
                const { id } = args;
                const { userId } = context;
                try {
                    if (!userId) {
                        throw new Error('Cannot delete without logging in');
                    }
                    const deleteLink = await context.prisma.link.delete({
                        where: {
                            id: id,
                        },
                    });
                    return id;
                } catch (error) {
                    console.error(error);
                    return -1;
                }
            },
        });
    },
});

export const LinkUpdate = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('update', {
            type: 'Link',
            args: {
                id: nonNull(intArg()),
                url: stringArg(),
                description: stringArg(),
            },
            async resolve(parent, args, context) {
                const { id, url, description } = args;
                const { userId } = context;

                if (!userId) {
                    throw new Error('Cannot delete without logging in');
                }
                const updateLink = await context.prisma.link.update({
                    where: {
                        id: id,
                    },
                    data: {
                        url: url || undefined,
                        description: description || undefined,
                    }
                });
                return updateLink;
            }
        })
    }
});

export const LinkQuery = extendType({  // 2
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {   // 3
            type: "Link",
            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
            },
            resolve(parent, args, context, info) {    // 4
                const where = args.filter
                ? {
                    OR: [
                        { description: { contains: args.filter }},
                        { url: { contains: args.filter }}
                    ]
                }
                : {};
                return context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined,
                    take: args?.take as number | undefined,
                });
            },
        });
    },
});

export const LinkGet = extendType({  // 2
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("linkget", {   // 3
            type: "Link",
            args: {
                id: nonNull(intArg()),
            },
            async resolve(parent, args, context, info) {    // 4
                const { id } = args;
                const { userId } = context;

                if (!userId) {
                    throw new Error('Cannot delete without logging in');
                }
                
                const getLink = await context.prisma.link.findMany({
                    where: {
                        id: id
                    },
                });

                return getLink;
            },
        });
    },
});

