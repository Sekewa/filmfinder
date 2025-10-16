// src/db.js
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
    `bolt://${process.env.NEO4J_HOST || 'localhost'}:7687`,
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASS || 'test1234'
    )
);

const getSession = () => {
    return driver.session();
};

module.exports = {
    driver,
    getSession
};