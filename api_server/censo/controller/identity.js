
function identityRequest(req, res) {
    var body = req.body;
    if(!body.msgid || !body.msg) {
        // no vale
        return res.status(400).send("No msgid or msg");
    }
    console.log(req.user);

    switch(body.msgid) {
        case 0:
            // Si es el primer mensaje, el censo revisa que no se le haya dado ya una identidad anonima
            if(req.user.identityGivenDate) {
                // Al usuario ya se la ha dado una identidad anonima
                return res.status(403).json("You already have an anonymous identity");
            }
            // Firmar identidad


            // Iniciar no repudio

            break;
        case 1:
            break;
        case 2:
            break;
        default:
            res.status(400).json("Unrecognized msg id");
    }
    res.status(200).send("Hi");
}

module.exports = {
    identityRequest
}
