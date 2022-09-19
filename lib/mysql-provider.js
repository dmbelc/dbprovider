const { SqlProvider } = require("./sql-provider");

const MysqlProvider = class extends SqlProvider {

    scalar = async (sql, params) => {
        const promisePool = this.pool.promise();
        // query database using promises
        const [rows,fields] = await promisePool.query(sql, params);

        return {rows: rows, fields: fields};
    };

    insertObject = async (object, tableName) => {
        return await this.insertObj(object, tableName, "`", "?", false);
    }

    updateObject = async (object, tableName, whereKVs) => {
        return await this.updateObj(object, tableName, whereKVs, "`", "?", false);
    }

    makeParameter = () => {
        return this.makeParam("?","");
    }
    getClient = async () => {
        const promisePool = this.pool.promise();
        return await promisePool.getConnection();
    }
}

module.exports.MysqlProvider = MysqlProvider;