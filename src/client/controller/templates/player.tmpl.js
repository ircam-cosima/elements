const playerTmpl = `
<div class="player" id="_<%= player.uuid %>" data-uuid="<%= player.uuid %>" data-index="<%= player.index %>">
  <div class="player-params"></div>
  <div class="stream-display sensors-display"></div>
  <div class="stream-display likelihoods-display"></div>
</div>
`;

export default playerTmpl;
