using Newtonsoft.Json;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

using System.Globalization;
using Newtonsoft.Json.Converters;
using Microsoft.AspNetCore.SignalR;
using DotnetReactFoma.Hubs;
using System.Timers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace DotnetReactFoma.Services
{
    public interface IMessaService
    {
        public Messe GetCurrentMessa();
        public int GetCurrentMesseId();
        public Messe GetTestMesse();
    }
    public class MessaService : IMessaService
    {
        private static Timer _UpdateTimer;
        private readonly IHubContext<MessaHub> _hubContext;
        private int _currentMesseId;
        IWebHostEnvironment _env;
        public MessaService(IHubContext<MessaHub> hc, IWebHostEnvironment env)
        {
            _hubContext = hc;
            //SetTimer();
            _env = env;
        }
        private void SetTimer()
        {
            _UpdateTimer = new Timer(60000);
            _UpdateTimer.Elapsed += (sender, e) => OnTimedEvent();
            _UpdateTimer.AutoReset = true;
            _UpdateTimer.Enabled = true;
            _UpdateTimer.Start();
        }

        public int GetCurrentMesseId()
        {
            return _currentMesseId;
        }

        private void OnTimedEvent()
        {
            var messa = GetCurrentMessa();

                
                _hubContext.Clients.All.SendAsync("Settings", messa);
                //_hubContext.Clients.Group("Admin").SendAsync("Settings", messa);
                //_hubContext.Clients.Group("User").SendAsync("Settings", messa);

                //if (UserHandler.ConnectedIds.Count() > 0)
                //{
                //    Clients.All.SendAsync("Settings", _MessaService.GetCurrentMessa());
                //}
            
        }

        public Messe GetCurrentMessa()
        {

            

            var client = new RestClient("https://foma.no/");

            var request = new RestRequest("umbraco/api/messeApi/getCurrentMesse", DataFormat.Json);

            var response = client.Get<Messe>(request);

            if (_env.IsDevelopment())
            {
                //response.Data.KontaktSelger.DeaktiverKontaktknappSelger = false;
                //response.Data.Konkurranse.DeaktiverKonkurransekknapp = false;
                //response.Data.KontaktSupport.DeaktiverKontaktknappSupport = false;
                //response.Data.Messebutikk.DeaktiverNettbutikklink = false;
                //response.Data.MesseStart = DateTime.Now.AddSeconds(5).ToUniversalTime();
                //foreach (var sending in response.Data.Sending)
                //{
                //    foreach (var skjema in sending.sendeskjema)
                //    {
                //        skjema.Klokkeslett = skjema.Klokkeslett.Add(TimeSpan.FromMinutes(120));
                //    }
                //}
            }

            _currentMesseId = response.Data.MesseId;

            return response.Data;

            //messa.Id = 17810;
            //_hubContext.Clients.Group("Admin").SendAsync("Settings", messa);
           // _hubContext.Clients.Group("User").SendAsync("Settings", messa);
           // return messa;
        }


        public Messe GetTestMesse()
        {

            var client = new RestClient("https://foma.no/");

            var request = new RestRequest("umbraco/api/messeApi/getMesseById?messeID=20399", DataFormat.Json);

            var response = client.Get<Messe>(request);

          

            _currentMesseId = response.Data.MesseId;

            return response.Data;

        }

    }



    public partial class Messe
    {
        [JsonProperty("messeID")]
        public int MesseId { get; set; }

        [JsonProperty("messeNavn")]
        public string MesseNavn { get; set; }

        [JsonProperty("messeStart")]
        public DateTimeOffset MesseStart { get; set; }

        [JsonProperty("messeSlutt")]
        public DateTimeOffset MesseSlutt { get; set; }

        [JsonProperty("videoUrl")]
        public Uri VideoUrl { get; set; }

        [JsonProperty("messeInfo")]
        public string MesseInfo { get; set; }

        [JsonProperty("logo2")]
        public Uri Logo2 { get; set; }

        [JsonProperty("farge")]
        public string Farge { get; set; }

        [JsonProperty("logo")]
        public Uri Logo { get; set; }

        [JsonProperty("bakgrunnsbilde")]
        public Uri Bakgrunnsbilde { get; set; }

        [JsonProperty("bildeNedtelling")]
        public Uri BildeNedtelling { get; set; }

        [JsonProperty("offlineTekst")]
        public string OfflineTekst { get; set; }

        [JsonProperty("tekstOverKnapper")]
        public string TekstOverKnapper { get; set; }

        [JsonProperty("bunntekst")]
        public string Bunntekst { get; set; }

        [JsonProperty("program")]
        public List<Program> Program { get; set; }

        [JsonProperty("konkurranse")]
        public Konkurranse Konkurranse { get; set; }

        [JsonProperty("kontaktSelger")]
        public KontaktSelger KontaktSelger { get; set; }

        [JsonProperty("kontaktSupport")]
        public KontaktSupport KontaktSupport { get; set; }

        [JsonProperty("messebutikk")]
        public Messebutikk Messebutikk { get; set; }

        [JsonProperty("konkurranseList")]
        public List<KonkurranseList> KonkurranseList { get; set; }

        [JsonProperty("sending")]
        public List<Sending> Sending { get; set; }

        [JsonProperty("contactMethods")]
        public ActiveContactMethods contactMethods { get; set; }
    }

    public class ActiveContactMethods
    {
        public bool Video { get; set; }
        public bool Phone { get; set; }
        public bool Chat { get; set; }
    }

    public partial class Sending
    {
        public DateTime sendingStarter { get; set; }
        public DateTime sendingSlutter { get; set; }
        public List<Program> sendeskjema { get; set; }
    }

    public partial class Konkurranse
    {
        [JsonProperty("konkurranseHeader")]
        public string KonkurranseHeader { get; set; }

        [JsonProperty("konkurranseText")]
        public string KonkurranseText { get; set; }

        [JsonProperty("tekstIPopupVindu")]
        public string TekstIPopupVindu { get; set; }

        [JsonProperty("visKonkurranseknapp")]
        public bool VisKonkurranseknapp { get; set; }

        [JsonProperty("deaktiverKonkurransekknapp")]
        public bool DeaktiverKonkurransekknapp { get; set; }
    }

    public partial class KonkurranseList
    {
        [JsonProperty("konkurranseId")]
        public long KonkurranseId { get; set; }

        [JsonProperty("konkurranseNavn")]
        public string KonkurranseNavn { get; set; }

        [JsonProperty("konkurranseStart")]
        public DateTimeOffset KonkurranseStart { get; set; }

        [JsonProperty("konkurranseSlutt")]
        public DateTimeOffset KonkurranseSlutt { get; set; }

        [JsonProperty("konkurranseTekst")]
        public string KonkurranseTekst { get; set; }
    }

    public partial class KontaktSelger
    {
        [JsonProperty("tekstlinje1PaaKnappSelger")]
        public string Tekstlinje1PaaKnappSelger { get; set; }

        [JsonProperty("tekstlinje2PaaKnappSelger")]
        public string Tekstlinje2PaaKnappSelger { get; set; }

        [JsonProperty("visKontaktknappSelger")]
        public bool VisKontaktknappSelger { get; set; }

        [JsonProperty("deaktiverKontaktknappSelger")]
        public bool DeaktiverKontaktknappSelger { get; set; }
    }

    public partial class KontaktSupport
    {
        [JsonProperty("tekstlinje1PaaKnappSupport")]
        public string Tekstlinje1PaaKnappSupport { get; set; }

        [JsonProperty("tekstlinje2PaaKnappSupport")]
        public string Tekstlinje2PaaKnappSupport { get; set; }

        [JsonProperty("visKontaktknappSupport")]
        public bool VisKontaktknappSupport { get; set; }

        [JsonProperty("deaktiverKontaktknappSupport")]
        public bool DeaktiverKontaktknappSupport { get; set; }
    }

    public partial class Messebutikk
    {
        [JsonProperty("tekstlinje1PaaKnapp")]
        public string Tekstlinje1PaaKnapp { get; set; }

        [JsonProperty("tekstlinje2PaaKnapp")]
        public string Tekstlinje2PaaKnapp { get; set; }

        [JsonProperty("visNettbutikklink")]
        public bool VisNettbutikklink { get; set; }

        [JsonProperty("deaktiverNettbutikklink")]
        public bool DeaktiverNettbutikklink { get; set; }
    }

    public partial class Program
    {
        [JsonProperty("klokkeslett")]
        public DateTimeOffset Klokkeslett { get; set; }

        [JsonProperty("navn")]
        public string Navn { get; set; }

        [JsonProperty("link")]
        public string Link { get; set; }
    }
}
