const { gql } = require('apollo-server-express');

const typeDefs = gql`
type User {
    _id: id
    username: String
    email: String
    bookCount: Int
    savedBooks: [Book]
}
type Book {
    bookId: Int
    authors: [String]
    description: String
    title: String
    image: String
    link: String
}
type Auth {
    token: ID!
    user: User
}

type Query {
    user(username: String!): User
}

type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    saveBook(bookId: String!): User
    deleteBook(bookId: String!): User
}
`;

module.exports = typeDefs