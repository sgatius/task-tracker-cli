#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'data.json');
const TaskTrackerAction = {
    ADD: 'add',
    UPDATE: 'update',
    DELETE: 'delete',
    MARK_IN_PROGRESS: 'mark-in-progress',
    MARK_DONE: 'mark-done',
    LIST: 'list'
};

const TaskTrackerStatus = {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    DONE: 'done'
}

function readOrCreateJSON(filePath, defaultData) {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } else {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
        return defaultData;
    }
}

function updateJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function printTask(task) {
    console.log(`ID: ${task.id}`);
    console.log(`Description: ${task.description}`);
    console.log(`Status: ${task.status}`);
    console.log(`Created At: ${task.createdAt}`);
    console.log(`Updated At: ${task.updatedAt}`);
    console.log('----------------');
}

function add(data, args) {
    if (args.length !== 2) {
        console.error('Task cannot be added without a description!');
        process.exit(1);
    }
    const currentDate = new Date().toISOString();
    if (data.length) {
        data.sort((a, b) => a.id - b.id);
    }
    const id = data.length ? data[data.length - 1].id + 1 : 1;
    data.push({
        id,
        description: args[1],
        status: TaskTrackerStatus.TODO,
        createdAt: currentDate,
        updatedAt: currentDate
    })
    updateJSON(filePath, data);
    console.info(`Task added successfully (ID: ${id})`);
    process.exit(0);
}

function update(data, args) {
    if (args.length !== 3) {
        console.error('Task cannot be updated without an ID and description!');
        process.exit(1);
    }
    const id = parseInt(args[1]);
    const task = data.find(task => task.id === id);
    if (!task) {
        console.error(`Task with ID ${id} not found!`);
        process.exit(1);
    }
    task.description = args[2];
    task.updatedAt = new Date().toISOString();
    updateJSON(filePath, data);
    console.info(`Task with ID ${id} updated successfully!`);
    process.exit(0);
}

function deleteItem(data, args) {
    if (args.length !== 2) {
        console.error('Task cannot be deleted without an ID!');
        process.exit(1);
    }
    const id = parseInt(args[1]);
    const index = data.findIndex(task => task.id === id);
    if (index === -1) {
        console.error(`Task with ID ${id} not found!`);
        process.exit(1);
    }
    data.splice(index, 1);
    updateJSON(filePath, data);
    console.info(`Task with ID ${id} deleted successfully!`);
    process.exit(0);
}

function markInProgress(data, args) {
    if (args.length !== 2) {
        console.error('Task cannot be marked in progress without an ID!');
        process.exit(1);
    }
    const id = parseInt(args[1]);
    const task = data.find(task => task.id === id);
    if (!task) {
        console.error(`Task with ID ${id} not found!`);
        process.exit(1);
    }
    if (task.status === TaskTrackerStatus.IN_PROGRESS) {
        console.error(`Task with ID ${id} is already in progress!`);
        process.exit(1);
    }
    task.status = TaskTrackerStatus.IN_PROGRESS;
    task.updatedAt = new Date().toISOString();
    updateJSON(filePath, data);
    console.info(`Task with ID ${id} marked in progress successfully!`);
    process.exit(0);
}

function markDone(data, args) {
    if (args.length !== 2) {
        console.error('Task cannot be marked done without an ID!');
        process.exit(1);
    }
    const id = parseInt(args[1]);
    const task = data.find(task => task.id === id);
    if (!task) {
        console.error(`Task with ID ${id} not found!`);
        process.exit(1);
    }
    if (task.status === TaskTrackerStatus.DONE) {
        console.error(`Task with ID ${id} is already done!`);
        process.exit(1);
    }
    task.status = TaskTrackerStatus.DONE;
    task.updatedAt = new Date().toISOString();
    updateJSON(filePath, data);
    console.info(`Task with ID ${id} marked done successfully!`);
    process.exit(0);
}

function printTasks(data, args) {
    if (args.length !== 1 && args.length !== 2) {
        console.error('Invalid arguments!');
        process.exit(1);
    }
    if (args.length === 1) {
        data.forEach(task => {
            printTask(task)
        });
    } else {
        const statusToFilter = args[1];
        if (statusToFilter !== TaskTrackerStatus.TODO && statusToFilter !== TaskTrackerStatus.IN_PROGRESS && statusToFilter !== TaskTrackerStatus.DONE) {
            console.error('Invalid filter list parameter!');
            process.exit(1);
        }
        data.filter(item => item.status === statusToFilter).forEach(task => {
            if (task.status === statusToFilter) {
                printTask(task);
            }
        });
    }
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('No arguments provided!');
  process.exit(1);
}
const data = readOrCreateJSON(filePath, []);
switch (args[0]) {
    case TaskTrackerAction.ADD:
        add(data, args);
        break;
    case TaskTrackerAction.UPDATE:
        update(data, args);
        break;
    case TaskTrackerAction.DELETE:
        deleteItem(data, args);
        break;
    case TaskTrackerAction.MARK_IN_PROGRESS:
        markInProgress(data, args);
        break;
    case TaskTrackerAction.MARK_DONE:
        markDone(data, args);
        break;
    case TaskTrackerAction.LIST:
        printTasks(data, args);
        break;
    default:
        console.error('Invalid action!');
        process.exit(1);
}