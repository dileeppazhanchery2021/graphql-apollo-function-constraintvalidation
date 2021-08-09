const { ApolloServer,gql} = require('apollo-server-azure-functions');
const ConstraintDirective = require('apollo-server-v2-constraint-directive');
const {makeExecutableSchema} = require('graphql-tools');

const schemaDirectives = {
  constraint: ConstraintDirective,
};
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
scalar ValidateString
  scalar ValidateNumber

  directive @constraint(
    # String constraints
    minLength: Int
    maxLength: Int
    startsWith: String
    endsWith: String
    notContains: String
    pattern: String
    format: String

    # Number constraints
    min: Int
    max: Int
    exclusiveMin: Int
    exclusiveMax: Int
    multipleOf: Int
  ) on INPUT_FIELD_DEFINITION
  type Book {
    title: String
    author: String
  }
  type Query {
    books: [Book],
	booksByAuthor(input:BookInput):[Book],
  }
  input BookInput {
    author: String @constraint(minLength: 5, format: "email")
  }
`;
const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
	booksByAuthor: (obj, args, context, info) => getBooksByAuthor(obj, args, context, info)
  },
};

function getBooksByAuthor(obj, args, context, info) {
	console.log("inside getBooksByAuthor()");
	console.log("Author: " + args.input.author);
	return books;
}


const server = new ApolloServer({ schema: makeExecutableSchema({ typeDefs, schemaDirectives, resolvers})});
exports.graphqlHandler = server.createHandler();