import '@apollo/client';
declare module '@apollo/client' {
  namespace ApolloClient {
    namespace DeclareDefaultOptions {
      // Affects client.watchQuery() and React hooks (useQuery, useSuspenseQuery, etc.)
      interface WatchQuery {
        errorPolicy: 'all';
      }
      // Affects client.query()
      interface Query {
        errorPolicy: 'all';
      }
      // Affects client.mutate()
      interface Mutate {
        errorPolicy: 'all';
      }
    }
  }
}
