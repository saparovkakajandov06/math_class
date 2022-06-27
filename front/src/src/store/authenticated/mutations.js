export default {
  SET_IS_AUTHENTICATED: (state, data) => {
    state.user_fio = data.fio
    state.user_powers = data.powers
    state.user_is_authenticated = data.status
  }
}
