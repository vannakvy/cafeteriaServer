import postsResolvers from './resolvers/posts.js'
import usersResolvers from './resolvers/users.js'
import commentsResolvers from './resolvers/comments.js'

const index = {
    Query: {
        ...postsResolvers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentsResolvers.Mutation,
    },
    Subscription: {
        ...postsResolvers.Subscription
    },
    Post: {
        ...postsResolvers.Post
    }
}

export default index

