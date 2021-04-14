export function updateDetails(connection, user) {

    connection.invoke("UpdateDetails", user).catch(function (err) {
        return console.error(err.toString());
    });
}

export default {
    updateDetails,

}