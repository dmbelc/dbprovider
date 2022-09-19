const { SqlProvider } = require("./sql-provider");

const PostgresProvider = class extends SqlProvider {
  
    seqNextval = async (seqName) =>{
        const sql = "select nextval($1)";
        let result = await this.scalar(sql,[seqName]);
        return result.rows[0].nextval;
    }

    scalar = async (sql, params) => {
        const result = await this.pool.query(sql, params);
        //console.log("Result from scalar: " + result.rows);
        return result;
    };

    insertObject = async (object, tableName) => {
        return await this.insertObj(object, tableName, '"', "$", true);
    }

    updateObject = async (object, tableName, whereKVs) => {
        return await this.updateObj(object, tableName, whereKVs, '"', "$", true);
    }

    makeParameter = (paramName) =>{
        return this.makeParam("$", paramName);
    }
    getClient = async () => {
        return await this.pool.connect();
    }
}

module.exports.PostgresProvider = PostgresProvider;