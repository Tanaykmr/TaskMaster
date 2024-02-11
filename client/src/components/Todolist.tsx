import React, {useState, useEffect} from "react";
import axios from "axios";
import {Card, Fab, TextField, Typography} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

const BASE_URL = import.meta.env.VITE_BASE_URL;
if (!BASE_URL) {
    console.error("BASE_URL is not defined in the environment variables in user.ts.");
    process.exit(1);
}


// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import Box from '@mui/material/Box';

// // Create a theme instance
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#ff5722', // Set the primary color
//     },
//     text: {
//       secondary: '#f50057', // Set the secondary text color
//     },
//   },
// });

// const MyComponent = () => {
//   return (
//     <ThemeProvider theme={theme}>
//       <Box
//         sx={{
//           bgcolor: 'primary.main',
//           color: 'text.secondary',
//           border: 4,
//           borderRadius: 2,
//           px: 2,
//           fontWeight: 'fontWeightBold',
//           zIndex: 'tooltip',
//           boxShadow: 8,
//         }}
//       >
//         Box
//       </Box>
//     </ThemeProvider>
//   );
// };
// export default MyComponent;

interface TodoStyleInterface {
    _id?: string,
    description: string,
    done: boolean,
    ownerId: string
}

const Todolist = () => {
    const [todos, setTodos] = useState<TodoStyleInterface[]>([]);
    // const getTodos = async () => {
    //     await axios.get(`${BASE_URL}/todos/all`, {
    //         headers: {
    //             Authorization: "Bearer " + localStorage.getItem("authorization")
    //         }
    //     }).then((response) => {
    //         console.log("response is: ", response)
    //         console.log("from response, todos are: ", response.data.todos);
    //         setTodos(response.data.todos);
    //     })
    // }

    useEffect(() => {
        // getTodos();
        axios.get(`${BASE_URL}/todos/all`, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("authorization")
            }
        }).then((response) => {
            console.log("response is: ", response)
            console.log("from response, todos are: ", response.data.todos);
            setTodos(response.data.todos);
        })
    }, [])

    console.log("Outside useEffect Todos are: ", todos);

    return (<div id="return-mother-div"
                 style={{display: "flex", flexDirection: "column", alignItems: "center", background: "orange"}}>
        <Card variant="outlined" sx={{borderRadius: "15px"}} style={{background: "#f0f0f0", marginBottom: "10px"}}>
            <Typography variant="h2" style={{padding: "5px"}}>TaskMaster </Typography>
        </Card>
        <CreateTodoComponent setTodos={setTodos}/>
        {todos.map((todo) => {
            return (<TodoListComponent key={todo._id} description={todo.description}/>)
        })}
    </div>)
}

function CreateTodoComponent(props) {
    const [newTodo, setNewTodo] = useState([])
    return (<div id="tododiv" style={{display: "flex", justifyContent: "space-between", padding: "5px",}}>
        <TextField id="filled-basic" label="write your next task" variant="outlined" sx={{borderRadius: "15px",}}
                   style={{background: "yellow", marginRight: "10px",}} onChange={((e) => {
            console.log("e.target.value :", e.target.value);
            setNewTodo(e.target.value);
            console.log("newTodo: ", newTodo);
        })}/>
        <Fab color="primary" aria-label="add" size="small" style={{marginTop: "10px"}} onClick={async () => {
            await axios.post(`${BASE_URL}/todos/create`, {
                description: newTodo
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authorization")}`
                }
            }).then((response) => {
                console.log("response after creating todo: ", response);
                console.log("newTodo is: ", newTodo)
                props.setTodos((prevTodos: TodoStyleInterface[]) => [...prevTodos, response.data.todo]);
            })
        }}>
            <AddIcon/>
        </Fab>

    </div>)
}

function TodoListComponent(props) {
    return (<Card style={{
        background: "#f0f0f0",
        width: "200px",
        height: "40px",
        marginBottom: "5px",
        padding: "3px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    }}>
        <Typography variant="subtitle1">{props.description}</Typography>
    </Card>)
}

export default Todolist;