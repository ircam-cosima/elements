const playerTmpl = `
<div class="player" id="_<%= player.uuid %>" data-uuid="<%= player.uuid %>" data-index="<%= player.index %>">
  <div class="player-params"></div>
  <div class="sensors-display"></div>
</div>
`;

export default playerTmpl;
