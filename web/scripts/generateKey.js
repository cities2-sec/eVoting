/**
 * Created by juan on 07/05/17.
 */

$(function () {
    if (localStorage.getItem("keys") === null) {
        var client = keys.generateKeys(2048);
        localStorage.setItem("keys", client);
    }

});