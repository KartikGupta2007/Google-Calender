'use client'

import React, { useState, useRef, useEffect } from "react";
import { Users, X } from "lucide-react";

// Sample people with names and emails
const samplePeople = [
  { name: "Aaron Mitchell", email: "aaron.mitchell@example.com" },
  { name: "Abigail Foster", email: "abigail.foster@example.com" },
  { name: "Adam Reynolds", email: "adam.reynolds@example.com" },
  { name: "Addison Hayes", email: "addison.hayes@example.com" },
  { name: "Adrian Brooks", email: "adrian.brooks@example.com" },
  { name: "Adriana Silva", email: "adriana.silva@example.com" },
  { name: "Aiden Murphy", email: "aiden.murphy@example.com" },
  { name: "Aimee Richardson", email: "aimee.richardson@example.com" },
  { name: "Alan Walker", email: "alan.walker@example.com" },
  { name: "Alana Peterson", email: "alana.peterson@example.com" },
  { name: "Albert King", email: "albert.king@example.com" },
  { name: "Alexandra Bennett", email: "alexandra.bennett@example.com" },
  { name: "Alexis Morgan", email: "alexis.morgan@example.com" },
  { name: "Alfred Howard", email: "alfred.howard@example.com" },
  { name: "Alice Johnson", email: "alice.johnson@example.com" },
  { name: "Alicia Coleman", email: "alicia.coleman@example.com" },
  { name: "Alison Turner", email: "alison.turner@example.com" },
  { name: "Allen Foster", email: "allen.foster@example.com" },
  { name: "Allison Gray", email: "allison.gray@example.com" },
  { name: "Alyssa Reed", email: "alyssa.reed@example.com" },
  { name: "Amanda Clarke", email: "amanda.clarke@example.com" },
  { name: "Amber Stevens", email: "amber.stevens@example.com" },
  { name: "Amelia Wright", email: "amelia.wright@example.com" },
  { name: "Amit Sharma", email: "amit.sharma@example.com" },
  { name: "Amira Hassan", email: "amira.hassan@example.com" },
  { name: "Amy Patterson", email: "amy.patterson@example.com" },
  { name: "Andrea Collins", email: "andrea.collins@example.com" },
  { name: "Andrew Barnes", email: "andrew.barnes@example.com" },
  { name: "Angela Ross", email: "angela.ross@example.com" },
  { name: "Angelina Hughes", email: "angelina.hughes@example.com" },
  { name: "Anita Powell", email: "anita.powell@example.com" },
  { name: "Anna Mitchell", email: "anna.mitchell@example.com" },
  { name: "Anthony Davis", email: "anthony.davis@example.com" },
  { name: "Antonio Ramirez", email: "antonio.ramirez@example.com" },
  { name: "April Sanders", email: "april.sanders@example.com" },
  { name: "Archer Bell", email: "archer.bell@example.com" },
  { name: "Aria Cooper", email: "aria.cooper@example.com" },
  { name: "Ariana Wood", email: "ariana.wood@example.com" },
  { name: "Ariel Fisher", email: "ariel.fisher@example.com" },
  { name: "Arnold Watson", email: "arnold.watson@example.com" },
  { name: "Arthur Nelson", email: "arthur.nelson@example.com" },
  { name: "Ashley Moore", email: "ashley.moore@example.com" },
  { name: "Ashton Bailey", email: "ashton.bailey@example.com" },
  { name: "Aubrey Rivera", email: "aubrey.rivera@example.com" },
  { name: "Audrey Bennett", email: "audrey.bennett@example.com" },
  { name: "Austin Ward", email: "austin.ward@example.com" },
  { name: "Ava Martinez", email: "ava.martinez@example.com" },
  { name: "Avery Cox", email: "avery.cox@example.com" },
  { name: "Bailey Griffin", email: "bailey.griffin@example.com" },
  { name: "Barbara Price", email: "barbara.price@example.com" },
  { name: "Barry Hughes", email: "barry.hughes@example.com" },
  { name: "Beatrice Russell", email: "beatrice.russell@example.com" },
  { name: "Becky Mason", email: "becky.mason@example.com" },
  { name: "Belinda Foster", email: "belinda.foster@example.com" },
  { name: "Benjamin Carter", email: "benjamin.carter@example.com" },
  { name: "Bennett Cole", email: "bennett.cole@example.com" },
  { name: "Bethany Hunt", email: "bethany.hunt@example.com" },
  { name: "Beverly Reed", email: "beverly.reed@example.com" },
  { name: "Bianca Torres", email: "bianca.torres@example.com" },
  { name: "Blake Sullivan", email: "blake.sullivan@example.com" },
  { name: "Bob Smith", email: "bob.smith@example.com" },
  { name: "Bobby Jenkins", email: "bobby.jenkins@example.com" },
  { name: "Bradley Hayes", email: "bradley.hayes@example.com" },
  { name: "Brandi Powell", email: "brandi.powell@example.com" },
  { name: "Brandon Foster", email: "brandon.foster@example.com" },
  { name: "Brandy Coleman", email: "brandy.coleman@example.com" },
  { name: "Breanna Long", email: "breanna.long@example.com" },
  { name: "Brenda Butler", email: "brenda.butler@example.com" },
  { name: "Brendan Mitchell", email: "brendan.mitchell@example.com" },
  { name: "Brent Sanders", email: "brent.sanders@example.com" },
  { name: "Brett Harrison", email: "brett.harrison@example.com" },
  { name: "Brian Thompson", email: "brian.thompson@example.com" },
  { name: "Briana Wells", email: "briana.wells@example.com" },
  { name: "Brianna Roberts", email: "brianna.roberts@example.com" },
  { name: "Bridget Murphy", email: "bridget.murphy@example.com" },
  { name: "Brittany Clark", email: "brittany.clark@example.com" },
  { name: "Brooke Alexander", email: "brooke.alexander@example.com" },
  { name: "Brooklyn Parker", email: "brooklyn.parker@example.com" },
  { name: "Bruce Campbell", email: "bruce.campbell@example.com" },
  { name: "Bryan Evans", email: "bryan.evans@example.com" },
  { name: "Bryant Phillips", email: "bryant.phillips@example.com" },
  { name: "Bryce Morgan", email: "bryce.morgan@example.com" },
  { name: "Byron Stewart", email: "byron.stewart@example.com" },
  { name: "Caitlin Edwards", email: "caitlin.edwards@example.com" },
  { name: "Caleb Ross", email: "caleb.ross@example.com" },
  { name: "Cameron Bell", email: "cameron.bell@example.com" },
  { name: "Camila Diaz", email: "camila.diaz@example.com" },
  { name: "Candace Morgan", email: "candace.morgan@example.com" },
  { name: "Cara Mitchell", email: "cara.mitchell@example.com" },
  { name: "Carl Peterson", email: "carl.peterson@example.com" },
  { name: "Carla Rogers", email: "carla.rogers@example.com" },
  { name: "Carlos Sanchez", email: "carlos.sanchez@example.com" },
  { name: "Carmen Rivera", email: "carmen.rivera@example.com" },
  { name: "Carol Watson", email: "carol.watson@example.com" },
  { name: "Caroline Brooks", email: "caroline.brooks@example.com" },
  { name: "Carolyn Reed", email: "carolyn.reed@example.com" },
  { name: "Carrie Henderson", email: "carrie.henderson@example.com" },
  { name: "Carson Gray", email: "carson.gray@example.com" },
  { name: "Carter James", email: "carter.james@example.com" },
  { name: "Casey Ford", email: "casey.ford@example.com" },
  { name: "Cassandra Barnes", email: "cassandra.barnes@example.com" },
  { name: "Cassidy Stone", email: "cassidy.stone@example.com" },
  { name: "Catherine Fisher", email: "catherine.fisher@example.com" },
  { name: "Cecilia Martinez", email: "cecilia.martinez@example.com" },
  { name: "Cedric Howard", email: "cedric.howard@example.com" },
  { name: "Celeste Palmer", email: "celeste.palmer@example.com" },
  { name: "Chad Murray", email: "chad.murray@example.com" },
  { name: "Chandler Ross", email: "chandler.ross@example.com" },
  { name: "Charity Wells", email: "charity.wells@example.com" },
  { name: "Charlene Hughes", email: "charlene.hughes@example.com" },
  { name: "Charles Warren", email: "charles.warren@example.com" },
  { name: "Charlie Brown", email: "charlie.brown@example.com" },
  { name: "Charlotte King", email: "charlotte.king@example.com" },
  { name: "Chase Coleman", email: "chase.coleman@example.com" },
  { name: "Chelsea Graham", email: "chelsea.graham@example.com" },
  { name: "Cheryl Simpson", email: "cheryl.simpson@example.com" },
  { name: "Chester Hayes", email: "chester.hayes@example.com" },
  { name: "Chloe Anderson", email: "chloe.anderson@example.com" },
  { name: "Chris Martin", email: "chris.martin@example.com" },
  { name: "Christian Lopez", email: "christian.lopez@example.com" },
  { name: "Christina Lee", email: "christina.lee@example.com" },
  { name: "Christine Allen", email: "christine.allen@example.com" },
  { name: "Christopher Young", email: "christopher.young@example.com" },
  { name: "Cindy Taylor", email: "cindy.taylor@example.com" },
  { name: "Claire Walker", email: "claire.walker@example.com" },
  { name: "Clara Scott", email: "clara.scott@example.com" },
  { name: "Clarence Hill", email: "clarence.hill@example.com" },
  { name: "Clark Kent", email: "clark.kent@example.com" },
  { name: "Claude Morrison", email: "claude.morrison@example.com" },
  { name: "Claudia Pierce", email: "claudia.pierce@example.com" },
  { name: "Clayton Foster", email: "clayton.foster@example.com" },
  { name: "Clifford Turner", email: "clifford.turner@example.com" },
  { name: "Clint Barton", email: "clint.barton@example.com" },
  { name: "Clinton Wells", email: "clinton.wells@example.com" },
  { name: "Cody Richardson", email: "cody.richardson@example.com" },
  { name: "Cole Bennett", email: "cole.bennett@example.com" },
  { name: "Colin Murray", email: "colin.murray@example.com" },
  { name: "Colleen Carter", email: "colleen.carter@example.com" },
  { name: "Colton Hayes", email: "colton.hayes@example.com" },
  { name: "Connor Walsh", email: "connor.walsh@example.com" },
  { name: "Constance Reed", email: "constance.reed@example.com" },
  { name: "Cora Mitchell", email: "cora.mitchell@example.com" },
  { name: "Corey Stevens", email: "corey.stevens@example.com" },
  { name: "Courtney Barnes", email: "courtney.barnes@example.com" },
  { name: "Craig Peterson", email: "craig.peterson@example.com" },
  { name: "Crystal Morgan", email: "crystal.morgan@example.com" },
  { name: "Curtis Powell", email: "curtis.powell@example.com" },
  { name: "Cynthia Cooper", email: "cynthia.cooper@example.com" },
  { name: "Daisy Johnson", email: "daisy.johnson@example.com" },
  { name: "Dakota Reed", email: "dakota.reed@example.com" },
  { name: "Dale Evans", email: "dale.evans@example.com" },
  { name: "Dallas Wright", email: "dallas.wright@example.com" },
  { name: "Dalton Barnes", email: "dalton.barnes@example.com" },
  { name: "Damian Cole", email: "damian.cole@example.com" },
  { name: "Damon Wells", email: "damon.wells@example.com" },
  { name: "Dana Mitchell", email: "dana.mitchell@example.com" },
  { name: "Daniel Brown", email: "daniel.brown@example.com" },
  { name: "Danielle Greene", email: "danielle.greene@example.com" },
  { name: "Danny Foster", email: "danny.foster@example.com" },
  { name: "Daphne Blake", email: "daphne.blake@example.com" },
  { name: "Darius Knight", email: "darius.knight@example.com" },
  { name: "Darlene Murphy", email: "darlene.murphy@example.com" },
  { name: "Darrell Washington", email: "darrell.washington@example.com" },
  { name: "Darren Hayes", email: "darren.hayes@example.com" },
  { name: "Darryl Stevens", email: "darryl.stevens@example.com" },
  { name: "Daryl Dixon", email: "daryl.dixon@example.com" },
  { name: "Dave Matthews", email: "dave.matthews@example.com" },
  { name: "David Miller", email: "david.miller@example.com" },
  { name: "Dawn Kelly", email: "dawn.kelly@example.com" },
  { name: "Dean Winchester", email: "dean.winchester@example.com" },
  { name: "Deanna Thompson", email: "deanna.thompson@example.com" },
  { name: "Debbie Reynolds", email: "debbie.reynolds@example.com" },
  { name: "Deborah Collins", email: "deborah.collins@example.com" },
  { name: "Debra Turner", email: "debra.turner@example.com" },
  { name: "Declan Murphy", email: "declan.murphy@example.com" },
  { name: "Delia Wright", email: "delia.wright@example.com" },
  { name: "Delilah Foster", email: "delilah.foster@example.com" },
  { name: "Denise Parker", email: "denise.parker@example.com" },
  { name: "Dennis Richards", email: "dennis.richards@example.com" },
  { name: "Derek Morgan", email: "derek.morgan@example.com" },
  { name: "Desiree Coleman", email: "desiree.coleman@example.com" },
  { name: "Destiny Hayes", email: "destiny.hayes@example.com" },
  { name: "Devin Peterson", email: "devin.peterson@example.com" },
  { name: "Devon Mitchell", email: "devon.mitchell@example.com" },
  { name: "Dexter Morgan", email: "dexter.morgan@example.com" },
  { name: "Diana Prince", email: "diana.prince@example.com" },
  { name: "Diane Foster", email: "diane.foster@example.com" },
  { name: "Diego Martinez", email: "diego.martinez@example.com" },
  { name: "Dillon Harper", email: "dillon.harper@example.com" },
  { name: "Dina Meyer", email: "dina.meyer@example.com" },
  { name: "Dominic Toretto", email: "dominic.toretto@example.com" },
  { name: "Dominique Reed", email: "dominique.reed@example.com" },
  { name: "Don Draper", email: "don.draper@example.com" },
  { name: "Donald Pierce", email: "donald.pierce@example.com" },
  { name: "Donna Reed", email: "donna.reed@example.com" },
  { name: "Donovan Mitchell", email: "donovan.mitchell@example.com" },
  { name: "Dora Martinez", email: "dora.martinez@example.com" },
  { name: "Doreen Green", email: "doreen.green@example.com" },
  { name: "Doris Day", email: "doris.day@example.com" },
  { name: "Dorothy Parker", email: "dorothy.parker@example.com" },
  { name: "Doug Ross", email: "doug.ross@example.com" },
  { name: "Douglas Adams", email: "douglas.adams@example.com" },
  { name: "Drake Bell", email: "drake.bell@example.com" },
  { name: "Drew Barrymore", email: "drew.barrymore@example.com" },
  { name: "Dustin Henderson", email: "dustin.henderson@example.com" },
  { name: "Dwayne Johnson", email: "dwayne.johnson@example.com" },
  { name: "Dylan Thomas", email: "dylan.thomas@example.com" },
  { name: "Earl Grey", email: "earl.grey@example.com" },
  { name: "Ebony Williams", email: "ebony.williams@example.com" },
  { name: "Eden Hayes", email: "eden.hayes@example.com" },
  { name: "Edgar Allen", email: "edgar.allen@example.com" },
  { name: "Edith Crawley", email: "edith.crawley@example.com" },
  { name: "Edmund Burke", email: "edmund.burke@example.com" },
  { name: "Edna Mode", email: "edna.mode@example.com" },
  { name: "Edward Norton", email: "edward.norton@example.com" },
  { name: "Edwin Powell", email: "edwin.powell@example.com" },
  { name: "Eileen Fisher", email: "eileen.fisher@example.com" },
  { name: "Elaine Benes", email: "elaine.benes@example.com" },
  { name: "Eleanor Roosevelt", email: "eleanor.roosevelt@example.com" },
  { name: "Elena Gilbert", email: "elena.gilbert@example.com" },
  { name: "Eli Manning", email: "eli.manning@example.com" },
  { name: "Elias Carter", email: "elias.carter@example.com" },
  { name: "Elijah Wood", email: "elijah.wood@example.com" },
  { name: "Elisa Maza", email: "elisa.maza@example.com" },
  { name: "Elizabeth Bennet", email: "elizabeth.bennet@example.com" },
  { name: "Ella Fitzgerald", email: "ella.fitzgerald@example.com" },
  { name: "Ellen Ripley", email: "ellen.ripley@example.com" },
  { name: "Ellie Williams", email: "ellie.williams@example.com" },
  { name: "Elliott Reed", email: "elliott.reed@example.com" },
  { name: "Ellis Boyd", email: "ellis.boyd@example.com" },
  { name: "Eloise Bridgerton", email: "eloise.bridgerton@example.com" },
  { name: "Elsa Frozen", email: "elsa.frozen@example.com" },
  { name: "Elvira Hancock", email: "elvira.hancock@example.com" },
  { name: "Elvis Presley", email: "elvis.presley@example.com" },
  { name: "Emanuel Santos", email: "emanuel.santos@example.com" },
  { name: "Ember Snow", email: "ember.snow@example.com" },
  { name: "Emerson Lake", email: "emerson.lake@example.com" },
  { name: "Emery Cole", email: "emery.cole@example.com" },
  { name: "Emil Blonsky", email: "emil.blonsky@example.com" },
  { name: "Emilia Clarke", email: "emilia.clarke@example.com" },
  { name: "Emily Rodriguez", email: "emily.rodriguez@example.com" },
  { name: "Emma Stone", email: "emma.stone@example.com" },
  { name: "Emmanuel Lewis", email: "emmanuel.lewis@example.com" },
  { name: "Emmett Brown", email: "emmett.brown@example.com" },
  { name: "Eric Forman", email: "eric.forman@example.com" },
  { name: "Erica Kane", email: "erica.kane@example.com" },
  { name: "Erin Gray", email: "erin.gray@example.com" },
  { name: "Ernest Hemingway", email: "ernest.hemingway@example.com" },
  { name: "Ernie Banks", email: "ernie.banks@example.com" },
  { name: "Esmeralda Garcia", email: "esmeralda.garcia@example.com" },
  { name: "Esperanza Rising", email: "esperanza.rising@example.com" },
  { name: "Essence Atkins", email: "essence.atkins@example.com" },
  { name: "Estelle Getty", email: "estelle.getty@example.com" },
  { name: "Esther Williams", email: "esther.williams@example.com" },
  { name: "Ethan Hunt", email: "ethan.hunt@example.com" },
  { name: "Eugene Levy", email: "eugene.levy@example.com" },
  { name: "Eva Green", email: "eva.green@example.com" },
  { name: "Evan Peters", email: "evan.peters@example.com" },
  { name: "Evangeline Lilly", email: "evangeline.lilly@example.com" },
  { name: "Eve Torres", email: "eve.torres@example.com" },
  { name: "Evelyn Salt", email: "evelyn.salt@example.com" },
  { name: "Everett Ross", email: "everett.ross@example.com" },
  { name: "Ezra Miller", email: "ezra.miller@example.com" },
  { name: "Faith Hill", email: "faith.hill@example.com" },
  { name: "Fallon Carrington", email: "fallon.carrington@example.com" },
  { name: "Felicity Smoak", email: "felicity.smoak@example.com" },
  { name: "Felix Unger", email: "felix.unger@example.com" },
  { name: "Fernando Torres", email: "fernando.torres@example.com" },
  { name: "Fiona Davis", email: "fiona.davis@example.com" },
  { name: "Fletcher Reed", email: "fletcher.reed@example.com" },
  { name: "Florence Nightingale", email: "florence.nightingale@example.com" },
  { name: "Floyd Mayweather", email: "floyd.mayweather@example.com" },
  { name: "Flynn Rider", email: "flynn.rider@example.com" },
  { name: "Forest Whitaker", email: "forest.whitaker@example.com" },
  { name: "Frances Bean", email: "frances.bean@example.com" },
  { name: "Francesca Bridgerton", email: "francesca.bridgerton@example.com" },
  { name: "Francis Underwood", email: "francis.underwood@example.com" },
  { name: "Frank Thompson", email: "frank.thompson@example.com" },
  { name: "Franklin Richards", email: "franklin.richards@example.com" },
  { name: "Fred Flintstone", email: "fred.flintstone@example.com" },
  { name: "Freddie Mercury", email: "freddie.mercury@example.com" },
  { name: "Frederick Douglass", email: "frederick.douglass@example.com" },
  { name: "Gabriel Iglesias", email: "gabriel.iglesias@example.com" },
  { name: "Gabriella Montez", email: "gabriella.montez@example.com" },
  { name: "Gail Simone", email: "gail.simone@example.com" },
  { name: "Garrett Hedlund", email: "garrett.hedlund@example.com" },
  { name: "Gary Cooper", email: "gary.cooper@example.com" },
  { name: "Gavin Rossdale", email: "gavin.rossdale@example.com" },
  { name: "Genesis Rodriguez", email: "genesis.rodriguez@example.com" },
  { name: "Geoffrey Rush", email: "geoffrey.rush@example.com" },
  { name: "George Wilson", email: "george.wilson@example.com" },
  { name: "Georgia Miller", email: "georgia.miller@example.com" },
  { name: "Gerald Ford", email: "gerald.ford@example.com" },
  { name: "Geraldine Ferraro", email: "geraldine.ferraro@example.com" },
  { name: "Gerard Butler", email: "gerard.butler@example.com" },
  { name: "Giancarlo Esposito", email: "giancarlo.esposito@example.com" },
  { name: "Gilbert Blythe", email: "gilbert.blythe@example.com" },
  { name: "Gina Torres", email: "gina.torres@example.com" },
  { name: "Giovanni Ribisi", email: "giovanni.ribisi@example.com" },
  { name: "Giselle Bundchen", email: "giselle.bundchen@example.com" },
  { name: "Gladys Knight", email: "gladys.knight@example.com" },
  { name: "Glen Powell", email: "glen.powell@example.com" },
  { name: "Glenda Jackson", email: "glenda.jackson@example.com" },
  { name: "Glenn Close", email: "glenn.close@example.com" },
  { name: "Gloria Steinem", email: "gloria.steinem@example.com" },
  { name: "Gordon Ramsay", email: "gordon.ramsay@example.com" },
  { name: "Grace Chen", email: "grace.chen@example.com" },
  { name: "Gracelyn Harper", email: "gracelyn.harper@example.com" },
  { name: "Grady Jarrett", email: "grady.jarrett@example.com" },
  { name: "Graham Norton", email: "graham.norton@example.com" },
  { name: "Grant Gustin", email: "grant.gustin@example.com" },
  { name: "Grayson Allen", email: "grayson.allen@example.com" },
  { name: "Greg House", email: "greg.house@example.com" },
  { name: "Gregg Popovich", email: "gregg.popovich@example.com" },
  { name: "Gregory Peck", email: "gregory.peck@example.com" },
  { name: "Greta Thunberg", email: "greta.thunberg@example.com" },
  { name: "Gretchen Wieners", email: "gretchen.wieners@example.com" },
  { name: "Griffin Drew", email: "griffin.drew@example.com" },
  { name: "Guadalupe Sanchez", email: "guadalupe.sanchez@example.com" },
  { name: "Guillermo del Toro", email: "guillermo.deltoro@example.com" },
  { name: "Gus Fring", email: "gus.fring@example.com" },
  { name: "Gustavo Fring", email: "gustavo.fring@example.com" },
  { name: "Guy Fieri", email: "guy.fieri@example.com" },
  { name: "Gwen Stacy", email: "gwen.stacy@example.com" },
  { name: "Gwendolyn Brooks", email: "gwendolyn.brooks@example.com" },
  { name: "Hadley Richardson", email: "hadley.richardson@example.com" },
  { name: "Hailey Baldwin", email: "hailey.baldwin@example.com" },
  { name: "Haley Dunphy", email: "haley.dunphy@example.com" },
  { name: "Hamilton Porter", email: "hamilton.porter@example.com" },
  { name: "Hannah Montana", email: "hannah.montana@example.com" },
  { name: "Harley Quinn", email: "harley.quinn@example.com" },
  { name: "Harold Finch", email: "harold.finch@example.com" },
  { name: "Harper Lee", email: "harper.lee@example.com" },
  { name: "Harriet Tubman", email: "harriet.tubman@example.com" },
  { name: "Harrison Ford", email: "harrison.ford@example.com" },
  { name: "Harry Potter", email: "harry.potter@example.com" },
  { name: "Harvey Specter", email: "harvey.specter@example.com" },
  { name: "Hayden Christensen", email: "hayden.christensen@example.com" },
  { name: "Hayley Marshall", email: "hayley.marshall@example.com" },
  { name: "Hazel Grace", email: "hazel.grace@example.com" },
  { name: "Heather Locklear", email: "heather.locklear@example.com" },
  { name: "Hector Salamanca", email: "hector.salamanca@example.com" },
  { name: "Heidi Klum", email: "heidi.klum@example.com" },
  { name: "Helen Mirren", email: "helen.mirren@example.com" },
  { name: "Helena Bonham Carter", email: "helena.bonham@example.com" },
  { name: "Henry Cavill", email: "henry.cavill@example.com" },
  { name: "Herbert Hoover", email: "herbert.hoover@example.com" },
  { name: "Herman Melville", email: "herman.melville@example.com" },
  { name: "Hermione Granger", email: "hermione.granger@example.com" },
  { name: "Hester Prynne", email: "hester.prynne@example.com" },
  { name: "Hilary Duff", email: "hilary.duff@example.com" },
  { name: "Hilda Spellman", email: "hilda.spellman@example.com" },
  { name: "Holden Caulfield", email: "holden.caulfield@example.com" },
  { name: "Holly Golightly", email: "holly.golightly@example.com" },
  { name: "Homer Simpson", email: "homer.simpson@example.com" },
  { name: "Hope Mikaelson", email: "hope.mikaelson@example.com" },
  { name: "Horace Mann", email: "horace.mann@example.com" },
  { name: "Howard Stark", email: "howard.stark@example.com" },
  { name: "Hudson Taylor", email: "hudson.taylor@example.com" },
  { name: "Hugh Grant", email: "hugh.grant@example.com" },
  { name: "Hugo Weaving", email: "hugo.weaving@example.com" },
  { name: "Hunter Hayes", email: "hunter.hayes@example.com" },
  { name: "Ian Malcolm", email: "ian.malcolm@example.com" },
  { name: "Ibrahim Hassan", email: "ibrahim.hassan@example.com" },
  { name: "Ida Wells", email: "ida.wells@example.com" },
  { name: "Idris Elba", email: "idris.elba@example.com" },
  { name: "Ignacio Varga", email: "ignacio.varga@example.com" },
  { name: "Igor Stravinsky", email: "igor.stravinsky@example.com" },
  { name: "Ilana Glazer", email: "ilana.glazer@example.com" },
  { name: "Ilene Chaiken", email: "ilene.chaiken@example.com" },
  { name: "Iliana Rodriguez", email: "iliana.rodriguez@example.com" },
  { name: "Imani Walker", email: "imani.walker@example.com" },
  { name: "Imogen Heap", email: "imogen.heap@example.com" },
  { name: "Ines Santos", email: "ines.santos@example.com" },
  { name: "Ingrid Bergman", email: "ingrid.bergman@example.com" },
  { name: "Iola Morton", email: "iola.morton@example.com" },
  { name: "Ira Glass", email: "ira.glass@example.com" },
  { name: "Irene Adler", email: "irene.adler@example.com" },
  { name: "Iris West", email: "iris.west@example.com" },
  { name: "Irma Grese", email: "irma.grese@example.com" },
  { name: "Irving Berlin", email: "irving.berlin@example.com" },
  { name: "Isaac Newton", email: "isaac.newton@example.com" },
  { name: "Isabel Archer", email: "isabel.archer@example.com" },
  { name: "Isabella Martinez", email: "isabella.martinez@example.com" },
  { name: "Isaiah Thomas", email: "isaiah.thomas@example.com" },
  { name: "Ishmael Reed", email: "ishmael.reed@example.com" },
  { name: "Isla Fisher", email: "isla.fisher@example.com" },
  { name: "Israel Adesanya", email: "israel.adesanya@example.com" },
  { name: "Ivan Drago", email: "ivan.drago@example.com" },
  { name: "Ivanka Trump", email: "ivanka.trump@example.com" },
  { name: "Ives Tanguy", email: "ives.tanguy@example.com" },
  { name: "Ivory Wayans", email: "ivory.wayans@example.com" },
  { name: "Ivy League", email: "ivy.league@example.com" },
  { name: "Izzy Stradlin", email: "izzy.stradlin@example.com" },
];

export default function SearchPeople() {
  const [searchText, setSearchText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [filteredPeople, setFilteredPeople] = useState<typeof samplePeople>([]);
  const [selectedPeople, setSelectedPeople] = useState<Array<typeof samplePeople[0]>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Show suggestions when focused, even without text
    if (isFocused) {
      if (searchText.length >= 1) {
        // Filter people based on search text
        const filtered = samplePeople.filter(person =>
          !selectedPeople.find(selected => selected.email === person.email) &&
          (person.email.toLowerCase().includes(searchText.toLowerCase()) ||
          person.name.toLowerCase().includes(searchText.toLowerCase()))
        );
        setFilteredPeople(filtered);
      } else {
        // Show all people (excluding already selected)
        const filtered = samplePeople.filter(person =>
          !selectedPeople.find(selected => selected.email === person.email)
        );
        setFilteredPeople(filtered);
      }
      setIsDropdownOpen(true);
    } else {
      setFilteredPeople([]);
      setIsDropdownOpen(false);
    }
  }, [searchText, selectedPeople, isFocused]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Clean up any pending blur timeout
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handlePersonClick = (person: typeof samplePeople[0]) => {
    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    setSelectedPeople([...selectedPeople, person]);
    setSearchText("");
    // Keep focus and dropdown open for multiple selections
    setIsFocused(true);
    setIsDropdownOpen(true);
    inputRef.current?.focus();
  };

  const handleRemovePerson = (email: string) => {
    setSelectedPeople(selectedPeople.filter(person => person.email !== email));
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Search Input Container */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '6px 10px',
          background: 'var(--gm3-sys-color-surface-container-high)',
          border: 'none',
          borderRadius: '4px',
          color: 'var(--text)',
          fontSize: '13px',
          fontWeight: 400,
          cursor: 'text',
          transition: 'all 0.2s',
          width: '100%',
          minHeight: '32px',
          boxSizing: 'border-box',
          marginTop: '4px',
        }}
      >
        {/* Selected People Chips */}
        {selectedPeople.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {selectedPeople.map((person) => (
              <div
                key={person.email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 6px 3px 3px',
                  background: 'var(--gm3-sys-color-surface-container)',
                  borderRadius: '14px',
                  fontSize: '12px',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: `hsl(${person.name.charCodeAt(0) * 10}, 60%, 50%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '11px',
                    flexShrink: 0,
                  }}
                >
                  {person.name.charAt(0)}
                </div>
                <span style={{ color: 'var(--text)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {person.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePerson(person.email);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gm3-sys-color-on-surface-variant)',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={18} style={{ color: 'var(--gm3-sys-color-on-surface-variant)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => {
              // Clear any pending blur timeout when focusing
              if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
                blurTimeoutRef.current = null;
              }
              setIsFocused(true);
            }}
            onBlur={() => {
              // Delay to allow click on dropdown items
              blurTimeoutRef.current = setTimeout(() => {
                setIsFocused(false);
                blurTimeoutRef.current = null;
              }, 200);
            }}
            placeholder="Search for people"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontSize: '13px',
              fontWeight: 400,
            }}
          />

          {/* Clear All Button */}
          {selectedPeople.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPeople([]);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                color: 'var(--gm3-sys-color-on-surface-variant)',
                flexShrink: 0,
                marginTop: '-6px',
              }}
              aria-label="Clear all selected people"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown with suggestions */}
      {isDropdownOpen && filteredPeople.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'var(--gm3-sys-color-surface-container-high)',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            maxHeight: '280px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {filteredPeople.map((person, index) => (
            <div
              key={index}
              onClick={() => handlePersonClick(person)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--text)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: `hsl(${index * 30}, 60%, 50%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '13px',
                  }}
                >
                  {person.name.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 400 }}>{person.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--gm3-sys-color-on-surface-variant)' }}>{person.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
