import { AuthenticationError, UserInputError } from 'apollo-server-errors';

import Post from '../../models/Post.js'
import checkAuth from '../../util/check-auth.js'

const posts = {
    Post: {
        likeCount: (parent) => parent.likes.length,
        commentCount: (parent) => parent.comments.length
    },
    Query: {
        async getAllPosts() {
            try {
                const posts = await Post.find().sort({ createdAt: -1 });

                return posts;
            } catch (err) {
                throw new Error(err)
            }
        },
        async getPost(_, { postId }) {
            try {
                const post = await Post.findById(postId);
                if (post) {
                    return post
                } else {
                    throw new Error('Post not found');
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async getAllPostsWithPagination(_, {
            paginationInput: { limit, keyword }
        }, context) {
            try {
                const reg = {$regex: keyword}

                // const allPosts = []
                const allPosts = await Post.find({
                    '$or': [
                        { 'body': reg }, 
                        { 'comments.body': reg },
                    ]
                }).populate({
                    path: "user",
                })

                const posts = await Post.find({
                    '$or': [
                        { 'body': reg }, 
                        { 'comments.body': reg }
                    ]
                }).sort({ createdAt: -1 }).limit(limit);
                const countPosts = await Post.countDocuments({
                    '$or': [
                        { 'body': reg }, 
                        { 'comments.body': reg }
                    ]
                })

                return {
                    data: posts,
                    pageInfo: {
                        message: "hi",
                        pageCount: countPosts
                    }
                };
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async createPost(_, { body }, context) {
            const user = checkAuth(context)

            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            })

            const post = await newPost.save()

            context.pubsub.publish('NEW_POST', {
                newPost: post
            })

            return post
        },
        async deletePost(_, { postId }, context) {
            const user = checkAuth(context)

            try {
                const post = await Post.findById(postId);
                if (user.username === post.username) {
                    await post.delete();
                    return 'Post deleted successfully'
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async likePost(_, { postId }, context) {
            const { username } = checkAuth(context)

            const post = await Post.findById(postId)

            if (post) {
                if (post.likes.find((like) => like.username === username)) {
                    // Post already likes, unlike it
                    post.likes = post.likes.filter((like) => like.username !== username);
                    await post.save()
                } else {
                    // Not liked, like post
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }

                await post.save();
                return post;
            } else throw new UserInputError('Post not found')
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_POST'])
        }
    }
}

export default posts