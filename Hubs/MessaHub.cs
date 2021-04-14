using DotnetReactFoma.Services;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace DotnetReactFoma.Hubs
{
    public class MessaHub : Hub
    {

        private static IMessaService _MessaService;


        public MessaHub(IMessaService ms )
        {
            _MessaService = ms;
        }

        public async Task UpdateSettings()
        {
            await Clients.Caller.SendAsync("Settings", _MessaService.GetCurrentMessa());
        }

        public async Task GetTestSettings()
        {
            await Clients.Caller.SendAsync("Settings", _MessaService.GetTestMesse());
        }

        public async Task GetMainStream()
        {
            await Clients.Caller.SendAsync("MainStreamUpdate", "https://www.youtube.com/embed/QddgFtWwn28");
        }
       
    }

}