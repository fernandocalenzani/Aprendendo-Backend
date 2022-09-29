exports.middlewareGlobal = (req, res, next) => {
  // ESCREVER MIDDLEWARE
  res.locals.umaVariavelLocal = 'valor variavel local';
  next();
}

exports.outroMiddleware = (req, res, next) => {
  // ESCREVER MIDDLEWARE 2
  next();
}

exports.check_csrf_error = (err, req, res) => {

  if (err && 'EBADCSRFTOKEN' === err.code ) {
    return res.render('404');
  }
};

exports.csrfMiddleware = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

