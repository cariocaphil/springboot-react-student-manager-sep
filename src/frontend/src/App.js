import './App.css';
import { Button } from "antd";
import {getAllStudents} from './client.js';

function App() {
  getAllStudents()
    .then((response) => console.log(response));
  return (
    <div className="App">
        <Button type="primary">Hello</Button>
    </div>
  );
}

export default App;
