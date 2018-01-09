const headerControlTmpl = `
<% if (players.length > 0) { %>
<p>Duplicate client audio</p>
<select id="duplicate-audio">
  <option value="">none</option>
  <% players.forEach(function(player) { %>
  <option value="<%= player.uuid %>"><%= player.type %> <%= player.index %></option>
  <% }); %>
</select>
<% } %>
`;

export default headerControlTmpl;
