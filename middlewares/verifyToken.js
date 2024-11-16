const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization;
  
    if (!idToken) {
      return res.status(401).send('Unauthorized');
    }
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      next();
    } catch (error) {
      return res.status(401).send('Unauthorized');
    }
  };
  