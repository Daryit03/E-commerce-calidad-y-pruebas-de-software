class TokenRecuperacionRepository {
  crear({ idUsuario, tokenHash, expiraEn, tipo }) { throw new Error('No implementado'); }
  buscarVigentePorUsuario(idUsuario, tipo) { throw new Error('No implementado'); }
  registrarIntentoFallido(idToken, maxIntentos) { throw new Error('No implementado'); }
  consumir({ idToken, idUsuario, passwordHash }) { throw new Error('No implementado'); }
  verificarCorreo({ idToken, idUsuario }) { throw new Error('No implementado'); }
}

module.exports = TokenRecuperacionRepository;