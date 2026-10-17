class TokenRecuperacionRepository {
  crear({ idUsuario, tokenHash, expiraEn }) { throw new Error('No implementado'); }
  buscarVigente(tokenHash) { throw new Error('No implementado'); }
  consumir({ idToken, idUsuario, passwordHash }) { throw new Error('No implementado'); }
}

module.exports = TokenRecuperacionRepository;