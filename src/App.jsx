import Rest from "./components/Rest";
import GraphQL from "./components/GraphQL";

const todoExamples = {
  rest: Rest,
  graphql: GraphQL,
};

const ActiveTodo = todoExamples.rest;
// const ActiveTodo = todoExamples.graphql;

function App() {
  return <ActiveTodo />;
}

export default App;
