const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');
const axios = require('axios');

const resolvers = {
    Query: {
        // get a single user; retrieve the logged in user without specifically searching for them
        me: async (parent, args, context) => {
            if (context.user) {
              return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in!');
          },
    },

    Mutation: {
        // create a user, sign a token
    addUser: async (_, { username, email, password }) => {
        const user = await User.create({
            username,
            email,
            password
        });
        const token = signToken(user);
        return { token, user };
    },
        // login a user, sign a token
    login: async (_, { email, password }) => {
        const user = await User.findOne({
            email
        });
        
        if (!user) {
            throw new AuthenticationError('No user found with this email');
        }
        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
            throw new AuthenticationError('Incorrect credentials');
        }
        const token = signToken(user);
        return { token, user };
    },
    // save a book to a user's `savedBooks`
    saveBook: async (_, { bookId }, context) => {
            if (!context.user) {
                throw new Error('You must be logged in to save a book!');
              }
              
      // Fetch the book details from Google Books API
      const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}`;
      const bookResponse = await axios.get(googleBooksUrl);

      // Information from the API response
      const bookInfo = {
        bookId: bookId,
        authors: bookResponse.data.volumeInfo.authors,
        description: bookResponse.data.volumeInfo.description,
        title: bookResponse.data.volumeInfo.title,
        image: bookResponse.data.volumeInfo.imageLinks.thumbnail,
        link: bookResponse.data.volumeInfo.previewLink,
      };
      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $push: { savedBooks: bookInfo } },
        { new: true }
      );

      return updatedUser;
         },
    // remove a book from `savedBooks`
    deleteBook: async (_, { bookId }, context) => {
        if (!context.user) {
          throw new Error('You must be logged in to delete a book!');
        }
  
        // Find the user by ID and pull the book from the savedBooks array
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
  
        return updatedUser;
      },
    },
};

module.exports = resolvers;