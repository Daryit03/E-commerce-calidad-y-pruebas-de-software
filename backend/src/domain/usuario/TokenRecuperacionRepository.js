class TokenRecuperacionRepository {
  crear({ idUsuario, tokenHash, expiraEn }) { throw new Error('No implementado'); }
  buscarVigentePorUsuario(idUsuario) { throw new Error('No implementado'); }
  registrarIntentoFallido(idToken, maxIntentos) { throw new Error('No implementado'); }
  consumir({ idToken, idUsuario, passwordHash }) { throw new Error('No implementado'); }
}

module.exports = TokenRecuperacionRepository;